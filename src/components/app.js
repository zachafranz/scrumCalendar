import React from 'react';
import ReactDOM from 'react-dom';
import Calendar from './calendar.js';

class App extends React.Component {
    render() {
        return (
            <div>
                <div class="App">
                    <header>
                    <div id="logo">
                        <span class="icon">date_range</span>
                        <span>
                        react<b>calendar</b>
                        </span>
                    </div>
                    </header>
                    <main>
                        <Calendar />
                    </main>
                </div>
            </div>
        )
    }
}

ReactDOM.render(<App />, document.getElementById("content"));