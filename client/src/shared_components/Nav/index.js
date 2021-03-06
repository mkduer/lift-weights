import React, {Component} from 'react';
import { Icon, Menu, Container, Dropdown } from 'semantic-ui-react';
import { Link } from 'react-router-dom';

import Avatar from '../Avatar';
import Logo from '../Logo';
import './index.css';

class Nav extends Component {
    constructor(props) {
        super(props);

        this.state = {
            logout: false
        }
    }

    handleLogout = async e => {
        e.preventDefault();
        await this.setState({ logout: true });
        await this.updateLogout();
    }

    updateLogout = () => {
        this.props.onLogout(this.state.logout);
    }

    render() {

        // modified from example of SemanticUI nav bar
        // source: https://github.com/Semantic-Org/Semantic-UI-React/blob/master/docs/src/layouts/HomepageLayout.js
        return (
            <div className='Menu'>
                <Menu size='large' inverted >
                    <Container>
                        <Menu.Item>
                            <Logo />
                        </Menu.Item>
                        <Menu.Menu position='right'>
                            <Menu.Item>
                                <Link to='/profile'>
                                    <Icon name='home' />
                                </Link>
                            </Menu.Item>
                            <Dropdown text='Account' pointing className='link item' >
                                <Dropdown.Menu >
                                    <Dropdown.Item>
                                        <div>
                                            <Link to='/profile/workouts' className='Link'>
                                                <Icon name='list layout' /> Workouts
                                            </Link>
                                        </div>
                                    </Dropdown.Item>
                                    <Dropdown.Item>
                                        <div>
                                            <Link to='/profile/exercises' className='Link'>
                                                <Icon name='unordered list' /> Exercises
                                            </Link>
                                        </div>
                                    </Dropdown.Item>
                                    <Dropdown.Item>
                                        <div>
                                            <Link to='/profile/measurements' className='Link'>
                                                <Icon name='line graph' /> Measurements
                                            </Link>
                                        </div>
                                    </Dropdown.Item>
                                    <Dropdown.Divider />
                                    <Dropdown.Item>
                                        <div>
                                            <Link to='/profile/settings' className='Link'>
                                                <Icon name='cog' /> Settings 
                                            </Link>
                                        </div>
                                    </Dropdown.Item>
                                    <Dropdown.Item>
                                        <div>
                                            <Link to='/logout' className='Link' onClick={this.handleLogout}>
                                                <Icon name='sign out' /> Logout
                                            </Link>
                                        </div>
                                    </Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>
                            <Menu.Item>
                                <Avatar user={this.props.user} id={this.props.id} />
                            </Menu.Item>
                        </Menu.Menu>
                    </Container>
                </Menu>
            </div>
        );
    }
}

export default Nav;