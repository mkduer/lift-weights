'use strict';

const express = require('express');  // express framework
const mysql = require('mysql');      // mysql database
const cors = require('cors');        // cross-origin requirements middleware
const session = require('express-session'); // allows for session creation
const mysqlStore = require('express-mysql-session')(session);
const timeout = require('connect-timeout');

// running express application object
const app = express();
app.use(timeout('5s'));
app.use(haltOnTimedout);

// create a local database connection if in development
if (process.env.NODE_ENV != 'production') {
    var db = mysql.createConnection({
        host : 'localhost',
        user : 'trainer',
        password : 'session',
        database : 'gym'
    });

    var sessionStore = new mysqlStore(db);

    // connected to database
    db.connect(err => {
        if(err) {
            return err;
        }
        console.log("Connected to DB!")
    });

    // setup session creation
    app.use(session({
        secret: 'super secret wip',
        resave: false,
        store: sessionStore,
        saveUninitialized: true
    }));
}

// relax cross-origin policy to account for two servers 
// using different ports while in development
app.use(cors());                                


// add new statistics
app.get("/stats/add", async (req, res) => {

    const { workoutId, data } = await req.query;
    const dataStr = await JSON.parse(data)

    // TODO: create query and insert
    // Add all details to stats table with exerciseId and workoutId
    // Replace exerciseId details in exercises table with last set details
    dataStr.forEach(async exercise => {
        const length = exercise.length -1;
        let i = 0;
        console.log('\nexerciseId: ' + exercise[length]);
        console.log('exercise name: ' + exercise[length - 1]);
        for (i = 0; i < length - 2; i++) {
            console.log(exercise[i])
        }
    })
    return res.json({
        data: {
            workoutId: workoutId,
            dataStr: dataStr
        }
    });
});

// retrieve exercises
app.get("/exercises/retrieve", async (req, res) => {
    const { id } = await req.query;
    const q_select = await `SELECT name, id FROM exercises WHERE workoutId='${id}'`;

    await db.query(q_select, async (err, select_res)  => {
        if(err) {
            return await res.status(500).error(err);
        }

        if (await select_res.length > 0) {
            return await res.status(202).send(select_res);
        } else {
            return await res.status(204);
        }
    })
})

// delete workouts
app.get("/workouts/delete", async (req, res) => {
    const { userId, id } = await req.query;
    const q_delete = await `DELETE FROM workouts WHERE userId='${userId}' AND id='${id}'`;

    await db.query(q_delete, async (err, delete_res)  => {
        if(err) {
            return await res.status(500).send(err);
        }
        return await res.status(202).send('Deleted ' + delete_res.affectedRows + ' workout(s)');
    })
})

// retrieve specific workout
app.get("/workout/retrieve", async (req, res) => {
    const { id } = await req.query;
    const q_select = await `SELECT name, id, equipment, sets, reps, weights, rpe, duration, date FROM exercises WHERE workoutId='${id}'`;

    await db.query(q_select, async (err, select_res)  => {
        if(err) {
            return await res.status(500).error(err);
        }

        if (await select_res.length > 0) {
            return await res.status(202).send(select_res);
        } else {
            return await res.status(400).error(err);
        }
    })
})

// retrieve workouts
app.get("/workouts/retrieve-all", async (req, res) => {
    const { id } = await req.query;
    const q_select = await `SELECT name, id FROM workouts WHERE userId='${id}'`;

    await db.query(q_select, async (err, select_res)  => {
        if(err) {
            return await res.status(500).error(err);
        }

        if (await select_res.length > 0) {
            return await res.status(202).send(select_res);
        } else {
            return await res.status(400).error(err);
        }
    })
})

// add a workout
app.get("/workout/new", async (req, res) => {

    const { userId, workoutName, exercises } = await req.query;
    const exercisesStr = await JSON.parse(exercises)

    const q_insert_workout = await `INSERT INTO workouts (userId, name, date) VALUES(${userId}, '${workoutName}', NOW())`;

    await db.query(q_insert_workout, async (err, insert_res)  => {
        if(err) {
            return res.status(404).send('Failed to add workout');
        } else {
            const workoutId = await insert_res.insertId;

            exercisesStr.forEach(async exercise => {
                if (await insertExercises(workoutId, exercise) === -1) {
                    return res.status(404).send('Failed to add exercise');
                } else {
                    return res.status(202).send(insert_res);
                }
            })
        }
    });
});

// insert an exercise
async function insertExercises(workoutId, exercise) {
    const q_insert_exercise = await `INSERT INTO exercises (workoutId, wgerId, name) VALUES(${workoutId}, ${exercise.data.id}, '${exercise.data.name}')`;

    await db.query(q_insert_exercise, async (err, res)  => {
        if(err) {
            return -1;
        } else {
            return await insertMuscles(res.insertId, exercise)
        }
    });
}

// insert a muscle
async function insertMuscles(exerciseId, exercise) {
    const q_insert_muscle = await `INSERT INTO muscles (exerciseId, bodyLocation) VALUES(${exerciseId}, '${exercise.data.category}')`;

    await db.query(q_insert_muscle, async (err, res)  => {
        if(err) {
            return -1;
        } else {
            return await res.insertId;
        }
    });
}

// request handler for '/' page that redirects to '/login' page
app.get("/", (_, res) => {
    res.status(302);
    res.set({
        'Content-Type':'text/html',
        'Location':'/login'
    });
    res.end();
});

// request handler for '/login' page
app.get("/login", (req, res) => {
    res.status(202);
});

// request handler for '/login/match' page
app.get("/login/match", (req, res) => {
    const { username, password } = req.query;

    // check if user exists in database
    const q_select = `SELECT username, id FROM members WHERE username='${username}' AND password='${password}'`;

    db.query(q_select, (err, results)  => {
        if(err) {
            return res.status(500).error(err);
        } 

        if (results.length > 0) {
            req.session.user = results[0].username;

            return res.status(200).json({
                data: {
                    id: results[0].id, 
                    member:  results[0].username
                }
            });
        } else {
            // otherwise, redirect to login page if credentials were invalid
            return res.status(404).send('Invalid Credentials');
        }
    });
});

// request handler for '/register' page
app.get("/register", (_, res) => {
    res.status(202);
});

// add a user
app.get("/register/add", async (req, res) => {
    const { username, email, password } = await req.query;
    let new_id = '';

    const q_insert_user = `INSERT INTO members (username, email, password) \
                           VALUES('${username}', '${email}', '${password}')`;

    await db.query(q_insert_user, (err, results)  => {
        if(err) {
            return res.status(404).send('Failed to register user')
        } else {
            new_id = results.insertId;
        }
    })

    if (new_id === '') {
        new_id = retrieveUser(username, password);

        return res.status(202).json({
            data: {
                id: new_id,
                member: username
            }
        });
    } else {
        return res.status(202).json({
            data: {
                id: new_id,
                member: username
            }
        });
    }
});

// confirm successful registration by retrieving added user for account access
async function retrieveUser(username, password) {
    const q_select = await `SELECT username, id FROM members WHERE username='${username}' AND password='${password}'`;

    await db.query(q_select, (err, select_res)  => {
        if(err) {
            return select_res.status(500).error(err);
        }

        if (select_res.length > 0) {
            console.log('REPEAT QUERY: ' + select_res[0].id)
            return Promise.resolve(select_res[0].id);
        } else {
            // otherwise, redirect to registration page if credentials were invalid
            return Promise.reject(new Error('Registration failed'))
        }
    })
}

// request handler for '/profile' page
app.get("/profile", (req, res) => {
    if (!req.session.user) {
        return res.status(401).send();
    }

    return res.status(200).send("hello from profile page");
});

// source for setting up prod environment:
// https://www.udemy.com/node-with-react-fullstack-web-development/learn/lecture/7605196#overview
if (process.env.NODE_ENV === 'production') {
    // if an unknown page is requested, it is assumed to be a react Router route
    // and a search for a compiled, static file will be performed
    app.use(express.static('client/build'));

    // the index.html file will be re-served, otherwise, and the front-end will
    // handle the request.
    const path = require('path');
    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
    });
}

function haltOnTimedout (req, res, next) {
    if (!req.timedout) next()
}

// listen on specified port
const PORT = process.env.PORT || 5000;
app.listen(PORT);