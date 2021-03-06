import React, { Component } from 'react';
import { Card, Grid, Header } from 'semantic-ui-react';

import WorkoutModal from '../WorkoutModal';
import ExerciseList from '../ExerciseList';
import './index.css';

class WorkoutCard extends Component {
    constructor(props) {
        super(props);

        this.state = { 
            exercises: [],
            exercisesJSX: <div />,
            id: this.props.id,
            userId: this.props.userId
        };
    }

    componentDidMount = () => {
        this.getExercises();
    }

    // retrieve user's exercises for specified workout
    getExercises = async () => {
        let exercises = [];
        const res = await fetch(`http://localhost:5000/exercises/retrieve?id=${this.state.id}`, {
            method: 'GET',
            headers: {
                Accept: 'application/json',
            },
        })

        const resJSON = await res.json();

         resJSON.forEach(async e => {
            await exercises.push([e.name, e.id])
        })
        await this.setState({ exercises: exercises });
        await this.renderExercises();
    }

    updateWorkout = () => {
        this.props.updateWorkout();
    }

    renderExercises = async () => {
        if (await this.state.exercises.length > 0) {
            await this.setState({ exercisesJSX: <ExerciseList 
                                                    exercises={this.state.exercises} 
                                                    display='minimal' 
                                                /> 
            })
        }
    }

    render() {

        return (
            <Card className='workoutCard' color='grey'>
                <Card.Content className='cardHeader'>
                    <Header as='h5' color='blue'>
                        {this.props.name}
                    </Header>
                    {this.state.exercisesJSX}
                </Card.Content>
                <Grid columns='equal' className='cardButtons'>
                    <Grid.Row columns={3}>
                        <Grid.Column>
                            <WorkoutModal userId={this.state.userId} modalType='delete' workoutId={this.state.id} updateWorkout={this.updateWorkout} />
                        </Grid.Column>
                        <Grid.Column>
                            <WorkoutModal userId={this.state.userId} modalType='edit' workoutId={this.state.id} updateWorkout={this.updateWorkout} />
                        </Grid.Column>
                        <Grid.Column>
                            <WorkoutModal userId={this.state.userId} modalType='select' workoutId={this.state.id} updateWorkout={this.updateWorkout} workoutName={this.props.name} />
                        </Grid.Column>
                    </Grid.Row>
                </Grid>
            </Card>
        );
    }
}

export default WorkoutCard;