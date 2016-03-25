/**
 * Created by ebinhon on 3/22/2016.
 */
import React from 'react';
import Input from '../Input/Input';
import DateTimeField from 'react-datetime';

export default class Panel extends React.Component {
    static propTypes = {
        //React.PropTypes.string.isRequired,
        //React.PropTypes.bool,
        //React.PropTypes.object,
        //React.PropTypes.oneOf(['value1', 'value2'])
        //reference to official URL: https://facebook.github.io/react/docs/reusable-components.html
        data: React.PropTypes.arrayOf(React.PropTypes.object).isRequired,
        title: React.PropTypes.string.isRequired
    }

    static defaultProps = {
        title: "",
        data: []
    }

    constructor() {
        super();
        this.state = {}
    }

    componentDidMount() {

    }

    expandJSONObject(jsonObject) {
        let keys = [];
        for (let key in jsonObject) {
            keys.push(
                key
            );
        }
        return keys;
    }

    expandContent(data) {
        let tmpContent = [];
        let keys = this.expandJSONObject(data);
        let editable = false;
        let content_type = data.type;
        if (data.editable) {
            editable = true;
        }
        let label = <span className="bold_title">{data.label}:</span>;
        let label_value = editable ? content_type == "plannedStartTime" || content_type == "plannedArriveTime" ?
            <DateTimeField onChange={this.props.handleDate.bind(this,data.type)}/> :
            <Input name={data.type} blurFunction={this.props.blurFunction.bind(this)}/> : <span>{data.value}</span>;
        tmpContent.push(
            <div key="key">
                {label}
                {label_value}
            </div>
        );
        return tmpContent
    }

    renderPanelContent() {
        let content = this.props.data;
        let contents = [];
        for (let index in content) {
            contents.push(
                <div key={index}>
                    {this.expandContent(content[index])}
                </div>
            );
        }
        return contents;
    }

    render() {
        return (
            <div className="info_panel">
                <div className="panel_title">{this.props.title}</div>
                <div className="panel_content">
                    {this.renderPanelContent()}
                </div>
                {this.props.children}
            </div>
        );
    }
}