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

export default class Football extends Component {
    constructor() {
        super()

        this.state = {
            data: [],
            
            // fetch wikidata
            page: 1,
            sort: 'DEFAULT',
            type: '',
            q: ''
        }

    }


    render() {
        var items = this.state.data.map((item) => {
            return <WikiDataItem 
                    key={item.wikidata_id}
                    removeEntity={this.removeEntity}
                    item={item}/>
        })

        const {type, page, sort, q} = this.state;
        const params = {type, page, sort, q};



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
                <CCardHeader>
                <WikiDataManage/>
                </CCardHeader>
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
                            Club
                        </CNavLink>
                        </CNavItem>
                    </CNav>
                    <CTabContent>
                        <CTabPane>
                            <FootballMatchTable/>

                        </CTabPane>
                        <CTabPane>
                        {/* {`2. ${lorem}`} */}
                        </CTabPane>
                        <CTabPane>
                        {/* {`3. ${lorem}`} */}
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
