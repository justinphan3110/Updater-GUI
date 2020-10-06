import React, { Component } from 'react'
import {
    CCard,
    CCardBody,
    CCardHeader,
    CCol,
    CRow,
    CNavItem,
    CNavLink,
    CTabPane,
    CNav,
    CTabContent,
    CTabs,
    
    } from '@coreui/react'
import CIcon from '@coreui/icons-react'


import axios from 'axios';
import WikiDataItem from '../items/WikiDataItem';
import WikiDataManage from '../../manage/WikiDataManage';
import FootballMatchTable from '../../components/FootballMatchTable';
import FootballMatchManage from '../../manage/FootballMatchManage';
import FootballScoreboardManage from '../../manage/FootballScoreboardManage';
import FootballPlayerManage from '../../manage/FootballPlayerManage';
import FootballPlayerHonourManage from '../../manage/FootballPlayerHonourManage'

export default class Football extends Component {
    constructor(props) {
        super(props)

        this.state = {
            data: [],
            // NOTE may use later
            leagueIDs: [],
        }

    }

    componentDidMount() {
        this.fetchLeagueIDs();
    }

    fetchLeagueIDs() {
        const url = "http://" + process.env.REACT_APP_HOST + ":" + process.env.REACT_APP_KAFKA_CONSUMER_PORT + process.env.REACT_APP_KAFKA_CONSUMER_ROUTE + "/football/leagueIDs";
        axios.get(url).then((response) => {
            console.log("fetch football league IDs data success");
            this.setState( {
                leagueIDs: response.data.leagueIDs
            })

        }).catch((error) => {
            console.log("fetch football league IDs data failed")
        });
    }


    render() {
        var items = this.state.data.map((item) => {
            return <WikiDataItem 
                    key={item.wikidata_id}
                    removeEntity={this.removeEntity}
                    item={item}/>
        })


        return (
            <div>
                <CRow>
                    <CCol  md={{ size: 6, offset: 0 }}>
                        <h2>Ki-Ki Football V2 <CIcon name="cil-football" height="48" alt="Logo"/></h2>
                    </CCol>
                </CRow>

                <CRow>
            <CCol>

            <CCard>
                <CCardBody>
                    <CTabs>
                    <CNav variant="tabs">
                        <CNavItem>
                        <CNavLink>
                            Match
                        </CNavLink>
                        </CNavItem>
                        <CNavItem>
                        <CNavLink>
                            Scoreboard
                        </CNavLink>
                        </CNavItem>
                        <CNavItem>
                        <CNavLink>
                            Player
                        </CNavLink>
                        </CNavItem>
                        <CNavItem>
                        <CNavLink>
                            Player Honour
                        </CNavLink>
                        </CNavItem>
                    </CNav>
                    <CTabContent>
                        <CTabPane>
                            <FootballMatchManage />

                        </CTabPane>
                        <CTabPane>
                            <FootballScoreboardManage />
                        </CTabPane>
                        <CTabPane>
                            <FootballPlayerManage />
                        </CTabPane>
                        <CTabPane>
                            <FootballPlayerHonourManage/>
                        </CTabPane>
                    </CTabContent>
                    </CTabs>
                </CCardBody>
            </CCard>
            </CCol>
             </CRow>
            <br/>
                
            </div>
        )
    }
}
