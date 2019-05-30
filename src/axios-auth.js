import axios from 'axios'

const instance = axios.create({
  baseURL: 'https://vue-course-update-fc49e.firebaseio.com'
});

instance.defaults.headers.common['SOMETHING'] = 'something';

export default instance;
