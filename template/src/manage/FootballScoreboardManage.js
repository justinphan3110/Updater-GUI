// import React, { Component } from 'react'
import React, { Component } from 'react';
import { Spin } from 'antd';
import { Select, Button, Modal } from 'antd';
import {
    Pagination, PaginationItem, PaginationLink,
  } from 'reactstrap';

import {
    CBadge,
    CCol,
    CRow,    
    CCard,
    CCardBody,
    CCardHeader,
} from '@coreui/react';
import ReactJson from 'react-json-view'



export default class FootballScoreboardManage extends Component {
    constructor(props) {
        super(props)

        this.state = {
            connectedWS: false,
            ws: null,
            connectedTime: undefined,



            // kafka variables
            // deletedItems: [],
            places: [],
            time: 0,

            filterByLeagueID: undefined,
            filterByClubID: undefined,
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
        const {numberPerPage, page, filterByClubID, filterByLeagueID, connectedTime} = this.state
        
        if(numberPerPage !== nextState.numberPerPage || 
             page !== nextState.page ||
             filterByClubID !== nextState.filterByClubID || 
             filterByLeagueID !== nextState.filterByLeagueID || 
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
                this.setState({places: [...this.state.places, ...this.list]}, () => this.list = [])
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
        var url = process.env.REACT_APP_HOST + ":" + process.env.REACT_APP_KAFKA_CONSUMER_PORT + process.env.REACT_APP_KAFKA_CONSUMER_ROUTE + "/football/scoreboard";
        var ws = new WebSocket("ws://" + url);
        let that = this; // cache the this
        var connectInterval;

        // websocket onopen evefalsent listener
        ws.onopen = () => {
            
            this.toggleConnectWs(true);
            console.log("connected websocket Football Scoreboard component");
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

    viewJson(filteredPlaces) {
        Modal.info({
          content: (
            <ReactJson collapsed src={filteredPlaces} theme="shapeshifter:inverted" iconStyle="triangle" />
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

    render() {
        const { Option } = Select;


        // time diff 3 days in millis
        const {numberPerPage, page, filterByClubID, filterByLeagueID, connectedTime} = this.state
        const time_diff = 259200000;  
        
        var filteredPlaces = this.state.places
                                //reverse to filter out old updates with same club and same league
                                .reverse()
                                .filter((arr, index, self) => index === self.findIndex((t) => (t.clubID === arr.clubID && t.leagueID === arr.leagueID)))
                                .filter(i => !filterByLeagueID || i.leagueID === filterByLeagueID) 
                                .filter(i => !filterByClubID || i.clubID === filterByClubID)

        const pageCount = Math.ceil(filteredPlaces.length / this.state.numberPerPage);
        
        const clubs = this.uniqueArray(this.state.places.map(m => [m.clubLabel, m.clubID]))
        const leagues = this.uniqueArray(this.state.places.map(m => [m.leagueLabel, m.leagueID]))

        var viewPlaces = filteredPlaces
            .sort(function(a,b){return b.time - a.time})
            .slice(numberPerPage * (page - 1), numberPerPage * page)
            .map((i, index) => 
                        <tr key={index}>
                            <td>
                                {i.leagueImageURL && <img src={i.leagueImageURL} className="transfermarkt_profile_pic"/>}
                                <CBadge color={'info'} href={i.leagueCanonicalURL} target="_blank" style={{ fontSize: 16 }}>{i.leagueLabel}</CBadge>
                                <CBadge className="transfermarkt_id_tags" color="success">{i.leagueID}</CBadge>
                            </td>
                            <td>
                                {i.place.footballClubImgURL && <img src={i.place.footballClubImgURL} className="transfermarkt_profile_pic"/>}
                                <a href={i.clubCanonicalURL} target="_blank">
                                <span style={{ color: '#8A2BE2', marginLeft: "2%"}} >{i.clubLabel}</span>
                                <CBadge className="transfermarkt_id_tags" color="success">{i.clubID}</CBadge>
                                </a>
                            </td>
                            <td>
                                {i.place.group !== 'Z' && <CBadge style={{fontSize: 16}} color="light">{i.place.group}</CBadge>}
                            </td>
                            <td>
                                <CBadge style={{fontSize: 16}} color="light">{i.place.matches}</CBadge>
                            </td>
                            <td>
                                <CBadge style={{fontSize: 16}} color="success">{i.place.wins}</CBadge>
                            </td>
                            <td>
                                <CBadge style={{fontSize: 16}} color="secondary">{i.place.draws}</CBadge>
                            </td>
                            <td>
                                <CBadge style={{fontSize: 16}} color="danger">{i.place.loses}</CBadge>
                            </td>
                            <td>
                                <CBadge style={{fontSize: 16}} color="light">{i.place.GF}</CBadge>
                            </td>
                            <td>
                                <CBadge style={{fontSize: 16}} color="light">{i.place.GA}</CBadge>
                            </td>
                            <td>
                                <CBadge style={{fontSize: 16}} color="primary">{i.place.points}</CBadge>
                            </td>
                            <td>
                                <CBadge style={{fontSize: 16}} color="info">{i.place.points}</CBadge>
                            </td>
                            <td>
                                <CBadge style={{fontSize: 16}} color="secondary">{i.place.season}</CBadge>
                            </td>
                            <td>
                                {this.timeStampsToDate(i.time) ? this.timeStampsToDate(i.time): ""}
                                {connectedTime < i.time && <CBadge className="transfermarkt_id_tags" color="light-purple">New</CBadge>}
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
                                        <h4 className="text-body">{'Football Scoreboard Update'}</h4>
                                        <Spin spinning={!this.state.connectedWS}>
                                            <CBadge className="small" key={Math.random()} color={"success"}> {"Connected to Football Scoreboard Kafka Consumer Websocket"}</CBadge>
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
                                            placeholder="Filter by League"
                                            onChange={(v) => this.setState({filterByLeagueID: v, page: 1})}

                                            filterOption={(input, option) =>
                                                option.key.toLowerCase().indexOf(input.toLowerCase()) >= 0 
                                                || option.value.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                            }
                                        >
                                            {leagues.map(l => <Option key={l[0]} value={l[1]}>{l[0]}
                                            <CBadge className="transfermarkt_id_tags" color="success">{l[1]}</CBadge></Option>)}
                                        </Select>

                                        <Select
                                            size="large"
                                            showSearch
                                            allowClear
                                            style={{ width: "40%", marginLeft: "2%" }}
                                            placeholder="Filter by Club"
                                            onChange={(v) => this.setState({filterByClubID: v, page: 1})}
                                            filterOption={(input, option) =>
                                                option.key.toLowerCase().indexOf(input.toLowerCase()) >= 0 
                                                || option.value.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                            }
                                        >
                                            {clubs.map(l => <Option key={l[0]} value={l[1]}>{l[0]} 
                                            <CBadge className="transfermarkt_id_tags" color="success">{l[1]}</CBadge></Option>)}
                                        </Select>

                                        <Button style={{marginLeft:"10%"}} onClick={() => this.viewJson(filteredPlaces)} danger color="info">View JSON</Button>
                                </CRow>
                            </CCardHeader>
                            <CCardBody> 
                                
                            <br />

                            <table className="table table-hover table-striped table-borderless mb-0 d-none d-sm-table">
                                <thead className="thead-light">
                                <tr>
                                    <th className="text-black-60" scope="col">League</th>
                                    <th className="text-black-60" scope="col">Team</th>
                                    <th className="text-black-60" scope="col">Group</th>
                                    <th className="text-black-60" scope="col">Matches</th>
                                    <th className="text-black-60" scope="col">Wins</th>
                                    <th className="text-black-60" scope="col">Draws</th>
                                    <th className="text-black-60" scope="col">Loses</th>
                                    <th className="text-black-60" scope="col">Goal For</th>
                                    <th className="text-black-60" scope="col">Goal Against</th>
                                    <th className="text-black-60" scope="col">Points</th>
                                    <th className="text-black-60" scope="col">Place</th>
                                    <th className="text-black-60" scope="col">Season</th>
                                    <th className="text-black-60" scope="col">Time</th>
                                </tr>
                                </thead>
                                <tbody>
                                {viewPlaces}
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
