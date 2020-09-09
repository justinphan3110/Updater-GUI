import React, { Component } from 'react'
import {
  CBadge,
  CDropdown,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
  CProgress
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import SockJsClient from 'react-stomp';


export default class TheHeaderDropdownNotif extends Component {
  constructor(props) {
    super(props);

    // const ws = new WebSocket('ws://localhost:3001/consumer')
    
    this.state = {
      ws: null
    }

  }

 

  render() {
    const SOCKET_URL = 'http://localhost:3001/consumer/';
    const itemsCount = 5

    return (
      <CDropdown
        inNav
        className="c-header-nav-item mx-2"
      >
        <CDropdownToggle className="c-header-nav-link" caret={false}>
          <CIcon name="cil-bell"/>
          <CBadge shape="pill" color="danger">{itemsCount}</CBadge>
        </CDropdownToggle>
        <CDropdownMenu  placement="bottom-end" className="pt-0">
          <CDropdownItem
            header
            tag="div"
            className="text-center"
            color="light"
          >
            <strong>You have {itemsCount} notifications</strong>
          </CDropdownItem>









          {/* <CDropdownItem><CIcon name="cil-user-follow" className="mr-2 text-success" /> New user registered</CDropdownItem>
          <CDropdownItem><CIcon name="cil-user-unfollow" className="mr-2 text-danger" /> User deleted</CDropdownItem>
          <CDropdownItem><CIcon name="cil-chart-pie" className="mr-2 text-info" /> Sales report is ready</CDropdownItem>
          <CDropdownItem><CIcon name="cil-basket" className="mr-2 text-primary" /> New client</CDropdownItem>
          <CDropdownItem><CIcon name="cil-speedometer" className="mr-2 text-warning" /> Server overloaded</CDropdownItem>
          <CDropdownItem
            header
            tag="div"
            color="light"
          >{"level":"ERROR","timestamp":"2020-09-09T02:46:59.394Z","logger":"kafkajs","message":"[Runner] The group is rebalancing, re-joining","groupId":"node-js-consumer","memberId":"kafka-node-app-fdec6c4d-09cc-49e5-aef1-cffc151afc9b","error":"The group is rebalancing, so a rejoin is needed","retryCount":0,"retryTime":353}
            <strong>Server</strong>
          </CDropdownItem>
          <CDropdownItem className="d-block">
            <div className="text-uppercase mb-1">
              <small><b>CPU Usage</b></small>
            </div>
            <CProgress size="xs" color="info" value={25} />
            <small className="text-muted">348 Processes. 1/4 Cores.</small>
          </CDropdownItem>
          <CDropdownItem className="d-block">
            <div className="text-uppercase mb-1">
              <small><b>Memory Usage</b></small>
            </div>
            <CProgress size="xs" color="warning" value={70} />
            <small className="text-muted">11444GB/16384MB</small>
          </CDropdownItem>
          <CDropdownItem className="d-block">
            <div className="text-uppercase mb-1">
              <small><b>SSD 1 Usage</b></small>
            </div>
            <CProgress size="xs" color="danger" value={90} />
            <small className="text-muted">243GB/256GB</small>
          </CDropdownItem> */}
        </CDropdownMenu>
      </CDropdown>
    )
  }
  
}
