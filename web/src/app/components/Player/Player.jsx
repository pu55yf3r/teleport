/*
Copyright 2015 Gravitational, Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
import React from 'react';
import styled from 'styled-components';
import Slider from './Slider';
import Xterm from './Xterm';
import Alert from 'shared/components/Alerts';
import { TtyPlayer } from 'app/lib/term/ttyPlayer';
import { Indicator, Text } from 'shared/components';

export default class Player extends React.Component {

  constructor(props) {
    super(props);
    const { url } = this.props;
    this.tty = new TtyPlayer({url});
    this.state = this.calculateState();
  }

  calculateState(){
    return {
      eventCount: this.tty.getEventCount(),
      duration: this.tty.duration,
      min: 1,
      time: this.tty.getCurrentTime(),
      isLoading: this.tty.isLoading,
      isPlaying: this.tty.isPlaying,
      isError: this.tty.isError,
      errText: this.tty.errText,
      current: this.tty.current,
      canPlay: this.tty.length > 1
    };
  }

  componentDidMount() {
    this.tty.on('change', this.updateState)
    this.tty.connect();
    this.tty.play();
  }

  componentWillUnmount() {
    this.tty.stop();
    this.tty.removeAllListeners();
  }

  updateState = () => {
    const newState = this.calculateState();
    this.setState(newState);
  }

  onTogglePlayStop = () => {
    if(this.state.isPlaying){
      this.tty.stop();
    }else{
      this.tty.play();
    }
  }

  onMove = value => {
    this.tty.move(value);
  }

  render() {
    const {
      isPlaying,
      isLoading,
      isError,
      errText,
      time,
      min,
      duration,
      current,
      eventCount
    } = this.state;

    if (isError) {
      return (
        <Alert status="danger">
          Connection error
          <Text fontSize={1}> {errText || "Error"} </Text>
        </Alert>
      )
    }

    if (!isLoading && eventCount === 0 ) {
      return (
        <Alert status="warning">
          <Text fontSize={1}>
            recording for this session is not available.
          </Text>
        </Alert>
      )
    }

    return (
      <StyledPlayer>
        <Xterm tty={this.tty} />
        {isLoading && <Indicator />}
        {eventCount > 0 && (
          <ProgressBar
            isPlaying={isPlaying}
            time={time}
            min={min}
            max={duration}
            value={current}
            onToggle={this.onTogglePlayStop}
            onChange={this.onMove}/>)
        }
      </StyledPlayer>
     );
  }
}

class ProgressBar extends React.Component {

  render() {
    const { isPlaying, min, max, value, onChange, onToggle, time } = this.props;
    const btnClass = isPlaying ? 'fa fa-stop' : 'fa fa-play';
    return (
      <div className="grv-session-player-controls">
        <button className="btn" onClick={onToggle}>
          <i className={btnClass} />
        </button>
        <div className="grv-session-player-controls-time">{time}</div>
        <div className="grv-flex-column">
          <Slider
            min={min}
            max={max}
            value={value}
            onChange={onChange}
            defaultValue={1}
            withBars
            className="grv-slider" />
        </div>
      </div>
    )
  }
}

const StyledPlayer = styled.div`
  .grv-slider{
    height: 30px;
    padding: 3px;
  }

  .grv-slider .bar{
    height: 5px;
  }

  .grv-slider .handle{
    width: 14px;
    height: 14px;
    left: -10px;
    top: -4px;
    z-index: 1;
    border-radius: 14px;
    background: #FFF;
    box-shadow: inset 0 0 1px #FFF, inset 0 1px 7px #EBEBEB, 0 3px 6px -3px #BBB;
  }

  .grv-slider .bar-0{
    background: none repeat scroll 0 0 #bbbbbb;
    box-shadow: none;
  }

  .grv-slider .bar-1{
    background-color: #333;
  }
`;