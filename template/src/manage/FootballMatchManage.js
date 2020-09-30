// import React, { Component } from 'react'
import React, { Component, useState, useEffect } from 'react';
import { Spin, Alert } from 'antd';
import { Select } from 'antd';
import {
    Pagination, PaginationItem, PaginationLink,
  } from 'reactstrap';

import {
    CBadge,
    CCol,
    CRow,    
    // CButton, 
    // CNavItem,
    // CNavLink,
    // CTabPane,
    // CNav,
    // CTabContent,
    // CTabs,
    // CModal,
    // CModalHeader,
    // CModalTitle,
    // CModalBody,
    // CModalFooter,
        CCard,
    CCardBody,
    CCardHeader,
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import ReactJson from 'react-json-view'



export default class FootballMatchManage extends Component {
    constructor(props) {
        super(props)

        this.state = {
            connectedWS: false,
            ws: null,


            // kafka variables
            // deletedItems: [],
            matches: [],
            filterByLeagueID: undefined,
            filterByClubID: undefined,
            // loadingMatches: [],
            // viewMatches: [],

            viewMatch: false,       
            viewItem: undefined,

            // react pagination
            numberPerPage: 10,
            pageCount: 100,
            page: 1,

        }
    }

    

    componentDidMount() {
        // setInterval(this.connect(), 10000);
        // setInterval(this.connect.bind(this), 3000);
        this.connect();
        // console.log("props " + this.props.leagueIDs);
    }

    componentWillMount() {
        this.state.ws && this.state.ws.close();
    }


    // loadingMatchesIntoComponentMatches(loadingMatches) {
    //     const {numberPerPage, page} = this.state

    //     this.setState({matches: loadingMatches},
    //         () =>this.setState({ pageCount: Math.ceil(this.state.matches.length / this.state.numberPerPage), 
    //             viewMatches:  this.state.matches
    //                     .filter(i => i.time && i.matchTime && i.leagueID && i.awayTeamID && i.homeTeamID)
    //                     .sort(function(a,b){return b.time - a.time})
    //                     .slice(numberPerPage * (page - 1), numberPerPage * page)}))
    // }

    componentDidUpdate(prevProps, prevStates) {

        if(this.state.matches !== prevStates.matches) {
            // console.log("here   ")
            this.setState({
                matches: this.state.matches
            })
        }
    }

    toggleViewNewEntity(item) {
        this.setState( { viewMatch: ! this.state.viewMatch, viewItem: item});
    }

    toggleConnectWs(boo) {
        console.log(boo);
        this.setState( {connectedWS: boo});
    }


    test() {
        console.log("test")
    }

    
    timeout = 250; // Initial timeout duration as a class variable

    /**
     * @function connect
     * This function establishes the connect with the websocket and also ensures constant reconnection if connection closes
     */
    connect = () => {
        var url = process.env.REACT_APP_HOST + ":" + process.env.REACT_APP_KAFKA_CONSUMER_PORT + process.env.REACT_APP_KAFKA_CONSUMER_ROUTE + "/football/match";
        var ws = new WebSocket("ws://" + url);
        let that = this; // cache the this
        var connectInterval;

        var connectedTime;

        // websocket onopen evefalsent listener
        ws.onopen = () => {
            
            this.toggleConnectWs(true);
            console.log("connected websocket Football component");
            ws.send(process.env.REACT_APP_KAFKA_TOPIC);
            this.setState({ ws: ws});

            connectedTime = Date.now();
            that.timeout = 250; // reset timer to 250 on open of websocket connection 
            clearTimeout(connectInterval); // clear Interval on on open of websocket connection
        };

        setInterval(this.test(), 1000);

        // websocket onclose event listener
        ws.onclose = e => {
            this.toggleConnectWs(false);

            console.log(
                `Socket is closed. Reconnect will be attempted in ${Math.min(
                    10000 / 1000,
                    (that.timeout + that.timeout) / 1000
                )} second.`,
                e.reason
            );
            that.timeout = that.timeout + that.timeout; //increment retry interval
            connectInterval = setTimeout(this.check, Math.min(10000, that.timeout)); //call check function after timeout
        };

        // websocket onerror event listener
        ws.onerror = err => {

            this.toggleConnectWs(false);

            console.error(
                "Socket encountered error: ",
                err.message,
                "Closing socket"
            );

            ws.close();
        };

        let loadingMatches = [];
        // websocket on message
        ws.onmessage = (e) => {
            // console.log(e.data);
            var data = JSON.parse(e.data);
            loadingMatches.push(data);

            // this.loadingMatchesIntoComponentMatches(loadingMatches);
            this.setState({ matches: [...this.state.matches, data]})
        }
    };

    /**
     * utilited by the @function connect to check if the connection is close, if so attempts to reconnect
     */
    check = () => {
        const { ws } = this.state;
        if (!ws || ws.readyState == WebSocket.CLOSED) this.connect(); //check if websocket instance is closed, if so call `connect` function.
    };

    timeStampsToDate(timeStamp){
        if(timeStamp === undefined) return undefined

        var d = new Date(timeStamp);
        return d.getDate() + '/' + (d.getMonth()+1) + '/' + d.getFullYear() + " " + d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds();
    }

    paginationsGenerate(pageCount) {
        const { page } = this.state;

        const start = Math.max(1, page - 10);
        const end = Math.min(page + 11, pageCount);
        var list = Array(end - start + 1).fill().map((_, idx) => start + idx)
        return (
            <Pagination aria-label="Navigation">
                <PaginationItem disabled={page <= 1}>
            
                    <PaginationLink
                        onClick={e => this.handlePaginationClick(e, 1)}
                        first
                        href="#"
                    />
            
                </PaginationItem>
                {list.map((i) => 
                    <PaginationItem active={i === page} key={i}>
                        <PaginationLink onClick={e => this.handlePaginationClick(e, i)} href="#">
                            {i}
                        </PaginationLink>
                    </PaginationItem>
              )}
              <PaginationItem disabled={page >= pageCount}>
            
                <PaginationLink
                    onClick={e => this.handlePaginationClick(e, pageCount)}
                    last
                    href="#"
                />
        
                </PaginationItem>
            </Pagination>
        )
    }

    handlePaginationClick(e, pageNo) {
        e.preventDefault();

        this.setState({
            page: pageNo
        })
    }

    uniqueArray(arr) {
        var uniques = [];
        var itemsFound = {};
        for(var i = 0, l = arr.length; i < l; i++) {
            var stringified = JSON.stringify(arr[i]);
            if(itemsFound[stringified]) { continue; }
            uniques.push(arr[i]);
            itemsFound[stringified] = true;
        }
        return uniques;
    }
    

    render() {
        const { Option } = Select;


        // time diff 3 days in millis
        const {numberPerPage, page, filterByClubID, filterByLeagueID} = this.state
        const time_diff = 259200000;  
        
        // console.log("render matches " , this.state.matches.length)
        // new matches
        
        var filteredMatches = this.state.matches
                                .filter(i => i.time && i.matchTime && i.leagueID && i.awayTeamID && i.homeTeamID)
                                .filter(i => !filterByLeagueID || i.leagueID === filterByLeagueID); 
                                
        const pageCount = Math.ceil(filteredMatches.length / this.state.numberPerPage);
        
        const clubs = this.uniqueArray(this.state.matches.flatMap(m => [[m.homeTeamLabel, m.homeTeamID], [m.awayTeamLabel, m.awayTeamID]]))
        const leagues = this.uniqueArray(this.state.matches.map(m => [m.leagueLabel, m.leagueID]))

        var viewMatches = filteredMatches
            .sort(function(a,b){return b.time - a.time})
            .slice(numberPerPage * (page - 1), numberPerPage * page)
            .map((i, index) => 
                        <tr key={Math.random()} onClick={this.toggleViewNewEntity.bind(this, i)}>
                            <td><CBadge color={'info'} href={i.leagueCanonicalURL} target="_blank" style={{ fontSize: 16 }}>{i.leagueLabel}</CBadge>
                                <CBadge style={{marginLeft: "2%"}} color="success">{i.leagueID}</CBadge>
                            </td>
                            <td>
                                <a href={i.homeTeamCanonicalURL} target="_blank">
                                <span style={{ color: '#8A2BE2' }} >{i.homeTeamLabel}</span>
                                <CBadge style={{marginLeft: "2%"}} color="success">{i.homeTeamID}</CBadge>
                                </a>
                            </td>
                            <td>
                                <a href={i.awayTeamCanonicalURL} target="_blank">
                                    <span style={{ color: '#e65c00' }}>{i.awayTeamLabel}</span>
                                    <CBadge style={{marginLeft: "2%"}} color="success">{i.awayTeamID}</CBadge>
                                </a>
                            </td>
                            <td>
                                <CBadge href={i.matchPreviewURL} target="_blank" style={{fontSize: 16}} color="danger">{i.result}</CBadge>
                                
                            </td>
                            <td>
                                {this.timeStampsToDate(i.matchTime) ? this.timeStampsToDate(i.matchTime): ""}
                            </td>
                            <td>
                                {this.timeStampsToDate(i.time) ? this.timeStampsToDate(i.time): ""}
                                {Date.now() - i.time < time_diff && <CBadge style={{marginLeft:"2%"}} color="light-purple">New</CBadge>}
                            </td>
                        </tr>
        );


        return (
            <React.Fragment>
                <CRow>
            <CCol>
                        <CCard>
                            <CCardHeader>
                                <CRow>
                                    <CCol sm="5">
                                        <h4 className="text-body">{'Football Match Result'}</h4>
                                        <Spin spinning={!this.state.connectedWS}>
                                            <CBadge className="small" key={Math.random()} color={"success"}> {"Connected to Football Kafka Consumer Websocket"}</CBadge>
                                        </Spin>
                                    </CCol>
                                </CRow>
                                <CRow style={{marginTop: "2%"}}>
                                    {this.paginationsGenerate(pageCount)}
                                </CRow>
                                <CRow>
                                        <Select
                                            showSearch
                                            allowClear
                                            style={{ width: "40%" }}
                                            placeholder="Filter by League"
                                            optionFilterProp="children"
                                            onChange={(v) => this.setState({filterByLeagueID: v, page: 1})}
                                            // onChange={(v) => console.log(v)}

                                            filterOption={(input, option) =>
                                                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                            }
                                        >
                                            {/* <Option key={"None"} value={undefined}>{"None"}</Option> */}
                                            {leagues.map(l => <Option key={l[0]} value={l[1]}>{l[0]} <CBadge color="success">{l[1]}</CBadge></Option>)}
                                        </Select>
                                        <Select
                                            showSearch
                                            allowClear
                                            style={{ width: "40%", marginLeft: "2%" }}
                                            placeholder="Filter by Club"
                                            optionFilterProp="children"
                                                // onChange={(v) => this.setState({filterByClubID: v, page: 1})}
                                            onChange={(v) => console.log(v)}
                                            filterOption={(input, option) =>
                                                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                            }
                                        >
                                            {/* <Option key={"None"} value={undefined}>{"None"}</Option> */}
                                            {clubs.map(l => <Option key={l[0]} value={l[0]}>{l[0]} <CBadge color="success">{l[1]}</CBadge></Option>)}
                                        </Select>
                                </CRow>
                            </CCardHeader>

                            {/* <CModal 
                            show={this.state.viewNewEntity} 
                            onClose={this.toggleViewNewEntity.bind(this)}
                            color="info"
                            >
                            <CModalHeader closeButton>
                                <CModalTitle>
                                    Details Information
                                </CModalTitle>
                            </CModalHeader>
                            <CModalBody>
                                <ReactJson src={this.state.viewItem} theme="summerfruit:inverted" iconStyle="triangle" />
                            </CModalBody>
                            <CModalFooter>
                                <CButton color="secondary" onClick={this.toggleViewNewEntity.bind(this)}>close</CButton>
                            </CModalFooter>
                            </CModal>
                            </CCardHeader> */}
                            <CCardBody> 
                                
                            <br />

                            <table className="table table-hover table-striped table-borderless mb-0 d-none d-sm-table">
                                <thead className="thead-light">
                                <tr>
                                    {/* <th className="text-center"><CIcon name="cil-people" /></th> */}
                                    <th className="text-black-60" scope="col">League</th>
                                    <th className="text-black-60" scope="col">Home Team</th>
                                    <th className="text-black-60" scope="col">Away Team</th>
                                    <th className="text-black-60" scope="col">Result</th>
                                    <th className="text-black-60" scope="col">Match Time</th>
                                    <th className="text-black-60" scope="col">Updated Time</th>
                                </tr>
                                </thead>
                                <tbody>
                                {viewMatches}
                                </tbody>
                            </table>

                            </CCardBody>
                        </CCard>        
            </CCol>
        </CRow>
              
            </React.Fragment>
        )
    }
}
