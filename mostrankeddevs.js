const axios = require('axios');
const city = process.argv.slice(2)[0];

class MostRankedDevs {
  constructor(city) {
    this.city = city;
    this.first = [0];
    this.second = [0];
    this.third = [0];
  }

  //searching users from Kiev
  search() {
    axios({
      method: 'get',
      url: `https://api.github.com/search/users?q=location:${this.city}+language:javascript+followers:>100`,
      headers: { 'user-agent': 'node.js' },
    })
    .catch((err) => {
      console.log(err.response.data.message)
    })
    .then(response => {
      const users = response.data.items;
      this.getRepositories(users);
    })
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
          this.sort(stars, username);
        }
      })
      
      this.printResult();
    });
  }

  printResult(){
    console.log(this.first, this.second, this.third);
    console.log(this.first[1]);
    console.log(this.second[1]);
    console.log(this.third[1]);
  }

  sort(stars, name) {
    if (stars > this.third[0] && stars <= this.second[0]) {
      this.setThird(stars, name);
    } else if (stars > this.second[0] && stars <= this.first[0]) {
      this.setSecond(stars, name);
    } else if (stars > this.first[0]) {
      this.setFirst(stars, name);
    }
  }

  setFirst(stars, name) {
    this.third = this.second;
    this.second = this.first;
    this.first = [];
    this.first.push(stars);
    this.first.push(name);
  }

  setSecond(stars, name) {
    this.third = this.second;
    this.second = [];
    this.second.push(stars);
    this.second.push(name);
  }

  setThird(stars, name) {
    this.third = [];
    this.third.push(stars);
    this.third.push(name);
  }
}

const searcher = new MostRankedDevs(city);
searcher.search();
