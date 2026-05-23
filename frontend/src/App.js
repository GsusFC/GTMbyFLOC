import React from 'react';
import { BrowserRouter, Route, Switch, Redirect } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';

// Componentes
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Dashboard from './components/dashboard/Dashboard';
import ProjectDetails from './components/projects/ProjectDetails';
import NewProject from './components/projects/NewProject';
import Layout from './components/layout/Layout';

// Context
import { AuthProvider } from './context/AuthContext';

const theme = createTheme({
  palette: {
    primary: {
      main: '#2196f3',
    },
    secondary: {
      main: '#f50057',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <BrowserRouter>
          <Switch>
            <Route exact path="/login" component={Login} />
            <Route exact path="/register" component={Register} />
            <Route path="/">
              <Layout>
                <Switch>
                  <Route exact path="/" component={Dashboard} />
                  <Route exact path="/projects/new" component={NewProject} />
                  <Route path="/projects/:id" component={ProjectDetails} />
                  <Redirect to="/" />
                </Switch>
              </Layout>
            </Route>
          </Switch>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App; 