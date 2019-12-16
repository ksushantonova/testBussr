const axios = require('axios');
const city = process.argv.slice(2)[0];

class MostRankedDevs {
  constructor() {
    this.temporaryArr = [];
  }
  //searching users from city
  search(city, numberOfUsers) {
    if (this.isValidSity(city)) {
      for (let i = 0; i < numberOfUsers; i++) {
        this.temporaryArr.push([0]);
      }

      axios({
        method: 'get',
        url: `https://api.github.com/search/users?q=location:${city}+language:javascript+followers:>200`,
        headers: { 'user-agent': 'node.js' },
      })
        .then(response => {
          const users = response.data.items;
          this.getRepositories(users);
        })
        .catch(err => {
          console.log(err.response.data.message);
        });
    } else {
      console.log(`There is no city ${city}. Please enter valid city`);
    }
  }

  isValidSity(city) {
    return isNaN(Number(city)) && city.length <= 11;
  }

  //get their repositories
  getRepositories(users) {
    let repositories = users.map(user => {
      return axios({
        method: 'get',
        url: `https://api.github.com/search/repositories?q=user:${user.login}+language:javascript+stars:>=1+fork:true`,
        headers: { 'user-agent': 'node.js' },
      })
        .then(response => {
          return response.data;
        })
        .catch(err => {
          console.log(err.response.data.message);
        });
    });

    Promise.all(repositories)
      .then(responses => {
        responses.forEach(resp => {
          this.calculateResult(resp);
        });

        this.printResult();
      })
      .catch(err => {
        console.log(err.response.data.message);
      });
  }

  //calculate stars
  calculateResult(resp) {
    let stars = 0;
    resp.items.forEach(repo => {
      stars += repo.stargazers_count;
    });

    if (resp.items[0] !== undefined) {
      const username = resp.items[0].full_name.split('/')[0];

      //sort results
      this.sort(stars, username, this.temporaryArr.length - 1);
    }
  }

  printResult() {
    console.log(this.temporaryArr);
    this.temporaryArr.forEach(el => {
      console.log(el[1]);
    });
  }

  sort(stars, name) {
    function sortArray(i, arr) {
      if (i === 0 || (stars > arr[i][0] && stars <= arr[i - 1][0])) {
        if (i < arr.length - 1) {
          for (let j = arr.length - 1; j > i; j--) {
            arr[j] = arr[j - 1];
          }
        }
        arr[i] = [];
        arr[i].push(stars);
        arr[i].push(name);
      } else if (i !== 0) {
        sortArray(i - 1, arr);
      }
    }

    sortArray(this.temporaryArr.length - 1, this.temporaryArr);
  }
}

const searcher = new MostRankedDevs();
searcher.search(city, 3);
