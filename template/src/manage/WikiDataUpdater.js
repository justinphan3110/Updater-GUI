import React, { Component } from 'react'
import { Spin, Alert } from 'antd';
import {
    CBadge,
    CCol,
    CRow,    
    CButton, 
    CNavItem,
    CNavLink,
    CTabPane,
    CNav,
    CTabContent,
    CTabs,
    CModal,
    CModalHeader,
    CModalTitle,
    CModalBody,
    CModalFooter,
        CCard,
    CCardBody,
    CCardHeader,
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import ReactJson from 'react-json-view'


export default class WikiDataUpdater extends Component {
    constructor(props) {
        super(props)
        this.state = {
            connectedWS: false,
            ws: null,


            // kafka variables
            deletedItems: [],
            addItems: [],
            viewNewEntity: false,
            viewIndex: undefined,

        }
    }

    componentDidMount() {
        this.connect();

        console.log(this.state.deletedItems);
    }

    componentDidUpdate(prevProps, prevStates) {
        if(this.state.deletedItems !== prevStates.deletedItems) {
            this.setState({
                deletedItems: this.state.deletedItems
            })
        }
    }

    toggleViewNewEntity(index) {
        this.setState( { viewNewEntity: ! this.state.viewNewEntity, viewIndex: index});
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
    connect = () => {
        var url = process.env.REACT_APP_HOST + ":" + process.env.REACT_APP_KAFKA_CONSUMER_PORT + process.env.REACT_APP_KAFKA_CONSUMER_ROUTE + "/wikidata";
        var ws = new WebSocket("ws://" + url);
        let that = this; // cache the this
        var connectInterval;

        var connectedTime;

        // websocket onopen event listener
        ws.onopen = () => {
            
            this.toggleConnectWs(true);
            console.log("connected websocket WikiData component");
            ws.send('ner-incremental-local');
            this.setState({ ws: ws});

            connectedTime = Date.now();
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
            // console.log(e.data);
            var data = JSON.parse(e.data);

            switch(data.actionType) {
                case "DELETE": 
                    this.setState({ deletedItems: [...this.state.deletedItems, data]});
                    break;
                case "ADD": 
                    this.setState({ addItems : [...this.state.addItems, data]});
                    // this.
                    break;
                default: 
                    break;
            }
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

    render() {
        // time diff 3 days in millis
        const time_diff = 259200000;

        const addedItem = this.state.addItems
            .filter(i => i.time)
            .sort(function(a,b){return b.time - a.time})
            .map((i, index) => 
                        <tr key={Math.random} onClick={this.toggleViewNewEntity.bind(this, index)}>
                            <td><CBadge color="success">{i.type}</CBadge></td>
                            <td>
                                <CRow>
                                                                            <CIcon name="cil-user-follow" className="mr-2 text-success" />
                                                                            <div className="text-uppercase mb-1">{i.type}
                                                                            {Date.now() - i.time < time_diff && <CBadge color='light-purple'>new</CBadge>}

                                                                            </div>
                                </CRow>

                            </td>
                            <td>
                            {this.timeStampsToDate(i.time) ? this.timeStampsToDate(i.time): ""}
                            </td>
                        </tr>
        );

        const deletedItem = this.state.deletedItems
            .filter(i => i.time)
            .sort(function(a,b){return b.time - a.time})
            .map((i, index) => 
                <tr key={Math.random}>
                    <td>
                        <CRow>
                                                                    <CIcon name="cil-trash" className="mr-2 text-danger" />
                                                                    <span className="text-uppercase mb-1">{i.entityID}
                                                                    {Date.now() - i.time < time_diff && <CBadge className='float-right' color='danger'>new</CBadge>}
                                                                    </span>
                        </CRow>
                    </td>
                    <td>{this.timeStampsToDate(i.time)}</td>
                </tr>
            )


        return (
            <React.Fragment>
                <CRow>
            <CCol>
            <CTabs>
                    <CNav variant="tabs">
                        <CNavItem>
                        <CNavLink>
                            Manage
                        </CNavLink>
                        </CNavItem>
                        <CNavItem>
                        <CNavLink>
                            Add
                        </CNavLink>
                        </CNavItem>
                        <CNavItem>
                        <CNavLink>
                            Delete
                        </CNavLink>
                        </CNavItem>
      
                    </CNav>
                    <CTabContent>
                        <CTabPane/>
                        <CTabPane>
                        <CCard>
                            <CCardHeader>
                            <CRow>
                                <CCol sm="5">
                                    <h4 className="text-body">{'New Items'}</h4>
                                    <Spin spinning={!this.state.connectedWS}>
                                        <CBadge className="small" key={Math.random()} color={"success"}> {"Connected to Kafka Websocket"}</CBadge>
                                    </Spin>
                                </CCol>
                            </CRow>

                            <CModal 
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
                                <ReactJson src={this.state.addItems[this.state.viewIndex]} theme="summerfruit:inverted" iconStyle="triangle" />
                            </CModalBody>
                            <CModalFooter>
                                <CButton color="secondary" onClick={this.toggleViewNewEntity.bind(this)}>close</CButton>
                            </CModalFooter>
                            </CModal>
                            </CCardHeader>
                            <CCardBody>
                            <br />

                            <table className="table table-hover table-striped table-borderless mb-0 d-none d-sm-table">
                                <thead className="thead-light">
                                <tr>
                                    {/* <th className="text-center"><CIcon name="cil-people" /></th> */}
                                    <th className="text-black-60" scope="col">type</th>
                                    <th className="text-black-60" scope="col">Detail</th>
                                    <th className="text-black-60" scope="col">Time</th>
                                </tr>
                                </thead>
                                <tbody>
                                {addedItem}
                                </tbody>
                            </table>

                            </CCardBody>
                        </CCard>

                        </CTabPane>
                        <CTabPane>
                            <CCard>
                                <CCardHeader>
                                <CRow>
                                    <CCol sm="5">
                                        <h4 className="text-body">{'Deleted Items'}</h4>
                                        <Spin spinning={!this.state.connectedWS}>
                                            <CBadge className="small" key={Math.random()} color={"success"}> {"Connected to Kafka Websocket"}</CBadge>
                                        </Spin>
                                    </CCol>
                                </CRow>
                                </CCardHeader>
                                <CCardBody>
                                <br />

                                <table className="table table-hover table-striped table-borderless mb-0 d-none d-sm-table">
                                    <thead className="thead-light">
                                    <tr>
                                        <th className="text-black-60" scope="col">Item</th>
                                        <th className="text-black-60" scope="col">Time</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {deletedItem}
                                    </tbody>
                                </table>

                                </CCardBody>
                            </CCard>
                        </CTabPane>
                    </CTabContent>
                    </CTabs>
            
            </CCol>
        </CRow>
              
            </React.Fragment>
        )
    }
}
