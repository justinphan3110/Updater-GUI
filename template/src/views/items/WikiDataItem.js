import React, { Component } from 'react'
import {
    CBadge,
    CCollapse,
    CCardBody,
    CButton,
    CRow

} from '@coreui/react'
import  CIcon from '@coreui/icons-react'

export default class WikiDataItem extends Component {
    constructor(props) {
        super(props)
        const {item} = this.props;
        
        
        this.state = {
            item,
        }
    }



    timeStampsToDate(timeStamp){
        var d = new Date(timeStamp);
        return d.getDate() + '/' + (d.getMonth()+1) + '/' + d.getFullYear();
    }

    badges(typeArray, color) {
        return <div>{typeArray.map((s) => <CBadge key={Math.random()} color={color} style={{marginLeft: '2%'}}> {s}</CBadge> )}</div>
    }
    
    
    
    render() {
        const {wikidata_id, aliases, page_view, title, type, created_time, updated_time} = this.state.item

        return (
            <React.Fragment>
                <tr key={Math.random()}>
                    <th><p><a href="#" style={{ color: '#8A2BE2' }}>{wikidata_id}</a></p></th>
                    <td>{this.badges(type, 'success')}</td>
                    <td class="text-muted">{title}</td>
                    <td>{this.badges(aliases, 'blue')}</td>
                    <td>{page_view}</td>
                    <td>{updated_time ? this.timeStampsToDate(updated_time) : this.timeStampsToDate(created_time)}</td>
                    <td>    </td>
                </tr>
            </React.Fragment>

        )
    }
}
