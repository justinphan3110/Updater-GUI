// import React, { Component } from 'react'
import React, { Component, useState, useEffect } from 'react';
import { Spin, Alert } from 'antd';
import { Select, Button, Modal } from 'antd';
import {
    Pagination, PaginationItem, PaginationLink,
  } from 'reactstrap';

import {
    CBadge,
    CCol,
    CRow,    
    CButton, CWidgetIcon,

    CCollapse,
        CCard,
    CCardBody,
    CCardHeader,
} from '@coreui/react';
// import {CilBritishPound} from '@coreui/icons';
import CIcon from '@coreui/icons-react';
import ReactJson from 'react-json-view'



export default class FootballPlayerManage extends Component {
    constructor(props) {
        super(props)

        this.state = {
            connectedWS: false,
            ws: null,
            connectedTime: undefined,



            // kafka variables
            // deletedItems: [],
            players: [],
            time: 0,
            filterByClubID: undefined,
            filterByPlayerID: undefined,
            // loadingMatches: [],
            // viewMatches: [],

            viewJson: false,       
            // viewItem: undefined,

            // react pagination
            numberPerPage: 10,
            pageCount: 100,
            page: 1,

        }
    }

    // timerID for delay in receiving kafka message
    timerId = null;
    componentDidMount() {
        this.timerId = setInterval(() => {
            this.setState((prevState) => ({ time: prevState.time + 0.1 }));
        }, 100);

        this.connect();
    }

    componentWillMount() {
        clearInterval(this.timerId);
        this.state.ws && this.state.ws.close();
    }

    shouldComponentUpdate(nextProps, nextState) {
        const {numberPerPage, page, filterByClubID, filterByPlayerID, details, connectedTime} = this.state
        
        if(numberPerPage !== nextState.numberPerPage || 
             page !== nextState.page ||
             filterByClubID !== nextState.filterByClubID || 
             details !== nextState.details ||
             filterByPlayerID !== nextState.filterByPlayerID ||
             connectedTime !== nextState.connectedTime) {
            
            return true;
        }
        
        if(this.list.length === 0) {
            return false;
        }

        return true;        
    }

    componentDidUpdate(prevProps, prevStates) {
        if(this.state.time !== prevStates.time) {
                this.setState({players: [...this.state.players, ...this.list]}, () => this.list = [])
        }
    }

    toggleConnectWs(boo) {
        console.log(boo);
        this.setState( {connectedWS: boo});
    }
    
    timeout = 250; // Initial timeout duration as a class variable

    /**
     * @function connect
     * This function establishes the connect with the websocket and also ensures constant reconnection if connection closes
     */
    list = []
    connect = () => {
        var url = process.env.REACT_APP_HOST + ":" + process.env.REACT_APP_KAFKA_CONSUMER_PORT + process.env.REACT_APP_KAFKA_CONSUMER_ROUTE + "/football/playerStats";
        var ws = new WebSocket("ws://" + url);
        let that = this; // cache the this
        var connectInterval;

        // websocket onopen evefalsent listener
        ws.onopen = () => {
            
            this.toggleConnectWs(true);
            console.log("connected websocket Football Player component");
            ws.send(process.env.REACT_APP_KAFKA_TOPIC);
            this.setState({ ws: ws,connectedTime: Date.now()});

            that.timeout = 250; // reset timer to 250 on open of websocket connection 
            clearTimeout(connectInterval); // clear Interval on on open of websocket connection
        };

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

        // websocket on message
        ws.onmessage = (e) => {
            var data = JSON.parse(e.data);
            this.list.push(data);
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

    viewJson(filteredPlayers) {
        Modal.info({
          content: (
            <ReactJson collapsed src={filteredPlayers} theme="shapeshifter:inverted" iconStyle="triangle" />
          ),
          style:({top: "20%"}), width: 1000,
          onOk() {},
        });
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

    generateStatsTable(stats) {

        const leagues = Object.keys(stats);
        let attributes = new Set();
        
        Object.values(stats).forEach(element => {
            Object.keys(element).forEach(e => attributes.add(e))
        });
        // attributes = [... new Set()]

        return (
        <table className="table table-hover table-striped table-borderless mb-0 d-none d-sm-table">
            <thead className="thead-light">
            <tr>
                <th key={'LeagueID'} className="text-black-60" scope="col">League ID</th>
                {attributes.map(a => <th key={a} className="text-black-60" scope="col">{a}</th>)}
            </tr>
            </thead>
        <tbody>
            {Object.keys(stats).map((id)=> <tr key={id}>{this.generateDetailedStatsData(id, stats[id], attributes)}</tr>)}
        </tbody>
        </table>)
        return attributes;

    }
    
    generateDetailedStatsData(leagueID, stats, attributes) {
        // console.log(stats)
        return (
            <React.Fragment>
                <td key={leagueID}>
                    <CBadge href={"https://www.transfermarkt.com/primera-division/startseite/wettbewerb/" + leagueID} target="_blank"
                    style={{fontSize: "14px"}} color={leagueID === "total" ? "danger" : "info"}>
                        {leagueID}
                    </CBadge>
                </td>
                {attributes.map(s => <td key={s}><CBadge style={{fontSize: "15px"}} color="light">{stats[s]}</CBadge></td>)}
            </React.Fragment>        
        )
        
    }

    render() {
        const { Option } = Select;
        // console.log("render")

        // time diff 3 days in millis
        const {numberPerPage, page, filterByClubID, filterByPlayerID, connectedTime} = this.state
        const time_diff = 259200000;  
        
        var filteredPlayers = this.state.players
                                //reverse to filter out old updates with same player
                                .reverse()
                                .filter((arr, index, self) => index === self.findIndex((t) => (t.clubID === arr.clubID && t.playerID === arr.playerID)))
                                .filter(i => !filterByPlayerID || i.playerID === filterByPlayerID) 
                                .filter(i => !filterByClubID || i.clubID === filterByClubID)

        const pageCount = Math.ceil(filteredPlayers.length / this.state.numberPerPage);
        
        const clubs = this.uniqueArray(this.state.players.map(m => [m.clubLabel, m.clubID]))
        const leagues = this.uniqueArray(this.state.players.map(m => [m.playerLabel, m.playerID]))

        var viewPlaayers = filteredPlayers
            .sort(function(a,b){return b.time - a.time})
            .slice(numberPerPage * (page - 1), numberPerPage * page)
            .map((i, index) => 
                        <React.Fragment key={index}>

                        <tr key={index}>
                            <td>
                                <CBadge className="badge-pill" color="danger" style={{fontSize: 14, marginRight: "2%" }}>{i.sportNumber}</CBadge>
                            </td>
                            <td>
                                {i.playerImageURL && <img src={i.playerImageURL} className="transfermarkt_profile_pic"/>}
                                <a href={i.playerCanonicalURL} target="_blank">
                                    <CBadge className="transfermarkt_id_tags" color="info" style={{fontSize: 16 }}>{i.playerLabel}</CBadge>
                                    <CBadge className="transfermarkt_id_tags" color="success">{i.playerID}</CBadge>
                                </a>
                            </td>
                            <td>
                                <a href={i.clubCanonicalURL} target="_blank">
                                    {i.clubImageURL && <img src={i.clubImageURL} className="transfermarkt_profile_pic"/>}
                                    <span style={{ color: '#8A2BE2', marginLeft: "2%" }} >{i.clubLabel}</span>
                                    <CBadge className="transfermarkt_id_tags" color="success">{i.clubID}</CBadge>
                                </a>
                            </td>
                            <td>
                                <CBadge style={{fontSize: 16}} color="light">{i.position}</CBadge>
                            </td>
                            <td>
                                <CBadge style={{fontSize: 16}} color="primary">{i.marketValue}</CBadge>
                            </td>
                            <td>
                                <CBadge style={{fontSize: 16}} color="secondary">{i.season}</CBadge>
                            </td>
                            <td>
                                {this.generateStatsTable(i.stats)}
                            </td>

                        </tr>
                        </React.Fragment>
        );


        return (
            <React.Fragment>
                <CRow>
            <CCol>
                        <CCard>
                            <CCardHeader>
                                <CRow>
                                    <CCol sm="5">
                                        <h4 className="text-body">{'Football Player Update'}</h4>
                                        <Spin spinning={!this.state.connectedWS}>
                                            <CBadge className="small" key={Math.random()} color={"success"}> {"Connected to Football Player Kafka Consumer Websocket"}</CBadge>
                                        </Spin>
                                    </CCol>
                                </CRow>
                                <CRow style={{marginTop: "2%"}}>
                                    {this.paginationsGenerate(pageCount)}
                                    
                                </CRow>
                                <CRow>
                                        <Select
                                            size="large"
                                            showSearch
                                            allowClear
                                            style={{ width: "40%" }}
                                            placeholder="Filter by Player"
                                            onChange={(v) => this.setState({filterByPlayerID: v, page: 1})}

                                            filterOption={(input, option) =>
                                                option.key.toLowerCase().indexOf(input.toLowerCase()) >= 0 
                                                || option.value.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                            }
                                        >
                                            {leagues.map(l => <Option key={l[0]} value={l[1]}>{l[0]}<CBadge className="transfermarkt_id_tags" color="success">{l[1]}</CBadge></Option>)}
                                        </Select>

                                        <Select
                                            size="large"
                                            showSearch
                                            allowClear
                                            style={{ width: "40%", marginLeft: "2%" }}
                                            placeholder="Filter by Club"
                                            onChange={(v) => this.setState({filterByClubID: v, page: 1})}
                                            // onChange={(v) => console.log(v)}
                                            filterOption={(input, option) =>
                                                option.key.toLowerCase().indexOf(input.toLowerCase()) >= 0 
                                                || option.value.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                            }
                                        >
                                            {clubs.map(l => <Option key={l[0]} value={l[1]}>{l[0]}<CBadge className="transfermarkt_id_tags" color="success">{l[1]}</CBadge></Option>)}
                                        </Select>

                                        <Button style={{marginLeft:"10%"}} onClick={() => this.viewJson(filteredPlayers)} danger color="info">View JSON</Button>
                                </CRow>
                            </CCardHeader>
                            <CCardBody> 
                                
                            <br />

                            <table className="table table-hover table-striped table-borderless mb-0 d-none d-sm-table">
                                <thead className="thead-light">
                                <tr>
                                    <th className="text-black-60" scope="col">#</th>
                                    <th className="text-black-60" scope="col">Player</th>
                                    <th className="text-black-60" scope="col">Team</th>
                                    <th className="text-black-60" scope="col">Position</th>
                                    <th className="text-black-60" scope="col">Market Value</th>
                                    <th className="text-black-60" scope="col">Season</th>
                                    <th className="text-black-60" scope="col">Statistics</th>
                                </tr>
                                </thead>
                                <tbody>
                                {viewPlaayers}
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
