import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import {store} from './app/store';
import {Provider} from 'react-redux';
import {SnackbarProvider} from 'notistack';

ReactDOM.render(
    <React.StrictMode>
        <Provider store={store}>
            <SnackbarProvider maxSnack={3}>
                <App/>
            </SnackbarProvider>
        </Provider>
    </React.StrictMode>,
    document.getElementById('root')
);
