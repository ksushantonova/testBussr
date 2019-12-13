const axios = require('axios');
const city = process.argv.slice(2)[0];

class MostRankedDevs {
  constructor(){
    this.temporaryArr = [];
  }
  //searching users from city
  search(city, numberOfUsers) {
    if(this.validateCity(city)){
      for(let i = 0; i < numberOfUsers; i++){
        this.temporaryArr.push([0]);
      }
  
      axios({
        method: 'get',
        url: `https://api.github.com/search/users?q=location:${city}+language:javascript+followers:>200`,
        headers: { 'user-agent': 'node.js' },
      })
      .catch((err) => {
        console.log(err.response.data.message)
      })
      .then(response => {
        const users = response.data.items;
        this.getRepositories(users);
      })
    } else {
      console.log(`There is no city ${ city }. Please enter valid city`);
    }
  }

  validateCity(city){
    if(typeof city !== 'string' || city.length > 11 ){
      return false;
    } else {
      return true;
    }
  }

  //get their repositories
  getRepositories(users){
    let repositories = users.map(user => {
      return axios({
        method: 'get',
        url: `https://api.github.com/search/repositories?q=user:${user.login}+language:javascript+stars:>=1+fork:true`,
        headers: { 'user-agent': 'node.js' },
      })
      .catch((err) => {
        console.log(err.response.data.message)
      })
      .then((response) => {
        return response.data;
      });
    });

    this.calculateResult(repositories);
  }

  //calculate stars
  calculateResult(data){
    Promise.all(data)
    .catch(err => {
      console.log(err.response.data.message)
    })
    .then(responses => {
      responses.forEach(resp => {
        let stars = 0;
        resp.items.forEach(repo => {
          stars += repo.stargazers_count;
        });

        if(resp.items[0] !== undefined){
          const username = resp.items[0].full_name.split('/')[0];

          //sort results
          this.sort(stars, username, this.temporaryArr.length - 1);
        }
      })
      
      this.printResult();
    });
  }

  printResult(){
    console.log(this.temporaryArr);
    this.temporaryArr.forEach((el) => {
      console.log(el[1]);
    })
  }

  sort(stars, name) {
    function sortArray(i, arr){
      if (i === 0 || (stars > arr[i][0] && stars <= arr[i - 1][0])){
        if(i < arr.length - 1){
          for (let j = arr.length - 1; j > i; j--){
            arr[j] = arr[j - 1];
          }
        }
        arr[i] = [];
        arr[i].push(stars);
        arr[i].push(name);
      } else if (i !== 0){
        sortArray(i - 1, arr);
      }
    }

    sortArray(this.temporaryArr.length - 1, this.temporaryArr);
}}

const searcher = new MostRankedDevs();
searcher.search(city, 3);