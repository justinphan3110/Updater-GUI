import React, { Component } from 'react'

export default class FootballMatchTable extends Component {
    render() {
        return (
            <div>
                <br />

                <table className="table table-hover table-striped table-borderless mb-0 d-none d-sm-table">
                    <thead className="thead-light">
                    <tr>
                        {/* <th className="text-center"><CIcon name="cil-people" /></th> */}
                        <th className="text-black-60" scope="col">League</th>
                        <th className="text-black-60" scope="col">Home Team</th>
                        <th className="text-black-60" scope="col">Away Team</th>
                        <th className="text-black-60" scope="col">Time</th>
                    </tr>
                    </thead>
                    <tbody>
                    {/* {items} */}
                    </tbody>
                </table>
            </div>
        )
    }
}
