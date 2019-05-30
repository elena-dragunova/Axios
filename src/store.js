import Vue from 'vue'
import Vuex from 'vuex'
import axiosInstance from './axios-auth';
import axios from 'axios';


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
    }
  },
  actions: {
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
          dispatch('storeUser', authData)
        })
        .catch(error => console.log(error));
    },
    login({commit}, authData) {
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
        })
        .catch(error => console.log(error));
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
    }
  }
})
