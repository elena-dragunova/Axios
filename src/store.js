import Vue from 'vue'
import Vuex from 'vuex'
import axiosInstance from './axios-auth';
import axios from 'axios';

import router from './router';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    idToken: null,
    userId: null,
    user: null
  },
  mutations: {
    authUser(state, userData) {
      state.idToken = userData.token;
      state.userId = userData.userId;
    },
    storeUser(state, user) {
      state.user = user;
    },
    clearAuthData(state) {
      state.idToken = null;
      state.userId = null;
    }
  },
  actions: {
    setLogoutTimer({commit}, expirationTime) {
      setTimeout( () => {
        commit('clearAuthData');
      }, expirationTime * 1000);
    },
    signup({commit, dispatch}, authData) {
      axiosInstance.post('/signupNewUser?key=AIzaSyD9R0vzUc5G3DngckuxxOeUJ9woS-DEy2w', {
        email: authData.email,
        password: authData.password,
        returnSecureToken: true,
      })
        .then(res => {
          console.log(res);
          commit('authUser', {
            token: res.data.idToken,
            userId: res.data.localId
          });
          const now = new Date();
          const expDate = new Date(now.getTime() + res.data.expiresIn * 1000);
          localStorage.setItem('token', res.data.idToken);
          localStorage.setItem('expDate', expDate);
          localStorage.setItem('userId', res.data.localId);
          dispatch('storeUser', authData);
          dispatch('setLogoutTimer', res.data.expiresIn);
        })
        .catch(error => console.log(error));
    },
    login({commit, dispatch}, authData) {
      axiosInstance.post('/verifyPassword?key=AIzaSyD9R0vzUc5G3DngckuxxOeUJ9woS-DEy2w', {
        email: authData.email,
        password: authData.password,
        returnSecureToken: true,
      })
        .then(res => {
          console.log(res);
          commit('authUser', {
            token: res.data.idToken,
            userId: res.data.localId
          });
          const now = new Date();
          const expDate = new Date(now.getTime() + res.data.expiresIn * 1000);
          localStorage.setItem('token', res.data.idToken);
          localStorage.setItem('expDate', expDate);
          localStorage.setItem('userId', res.data.localId);
          dispatch('setLogoutTimer', res.data.expiresIn);
        })
        .catch(error => console.log(error));
    },
    tryAutoLogin({commit}) {
      const token = localStorage.getItem('token');
      if(!token) {
        return;
      }
      const expirationDate = localStorage.getItem('expDate');
      const now = new Date();
      if(now >= expirationDate) {
        return;
      }
      const userId = localStorage.getItem('userId');
      commit('authUser', {
        token,
        userId
      })
    },
    logout({commit}) {
      commit('clearAuthData');
      localStorage.removeItem('expDate');
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      router.replace('/signin');
    },
    storeUser({commit, state}, userData) {
      if(!state.idToken) {
        return;
      }
      axios.post('/users.json' + '?auth=' + state.idToken, userData)
        .then(res => console.log(res))
        .catch(error => console.log(error));
    },
    fetchUser({commit, state}) {
      if(!state.idToken) {
        return;
      }
      axios.get('/users.json' + '?auth=' + state.idToken)
        .then(res => {
          const data = res.data;
          const users = [];
          for (let key in data) {
            const user = data[key];
            user.id = key;
            users.push(user);
          }
          commit('storeUser', users[0]);
        })
        .catch(error => console.log(error));
    }
  },
  getters: {
    user (store) {
      return store.user;
    },
    isAuthenticated(state) {
      return state.idToken !== null;
    }
  }
})
