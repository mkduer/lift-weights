import React, {Component} from 'react';
import { Grid, Container, Divider, Header } from 'semantic-ui-react';

import WorkoutCardList from '../../../shared_components/WorkoutCardList';
import WorkoutModal from '../../../shared_components/WorkoutModal';
import './index.css';


class Workouts extends Component {
    constructor(props) {
        super(props);

        this.state = { 
            userId: this.props.userId,
            workouts: [],
            workoutsJSX: <div></div>
        };
    }

    componentDidMount = () => {
        this.getWorkouts();
    }

    // retrieve user's workouts from database upon first render
    getWorkouts = async () => {
        let workouts = [];
        const res = await fetch(`http://localhost:5000/workouts/retrieve?id=${this.props.userId}`, {
            method: 'GET',
            headers: {
                Accept: 'application/json',
            },
        })

        const resJSON = await res.json();

         resJSON.forEach(async w => {
            await workouts.push([w.name, w.id, this.props.userId])
        })
        await this.setState({ workouts: workouts });
        await this.renderWorkouts();
    }

    // update workouts
    updateWorkout = async () => {
        await this.getWorkouts();
    }

    // render all workouts
    renderWorkouts = async () => {
        if (await this.state.workouts.length > 0) {
            await this.setState({ workoutsJSX: <WorkoutCardList workouts={this.state.workouts} updateWorkout={this.updateWorkout} /> })
        }
    }

    render() {
        return (
            <div className='Workouts'>
                <Container fluid>
                    <Grid>
                        <Grid.Row>
                            <WorkoutModal userId={this.state.userId} modalType="create" updateWorkout={this.updateWorkout} />
                        </Grid.Row>
                        <Divider horizontal>
                            <Header as='h3'>
                                Workouts
                            </Header>
                        </Divider>
                        <Grid.Row>
                            {this.state.workoutsJSX}
                        </Grid.Row>
                    </Grid>
                </Container>
            </div>
        );
    }
}

export default Workouts;