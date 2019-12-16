const axios = require('axios');
const city = process.argv.slice(2)[0];

class MostRankedDevs {
  search(city) {
    if (this.isValidSity(city)) {
      axios({
        method: 'get',
        url: `https://api.github.com/search/users?q=location:${city}+language:javascript+followers:>100`,
        headers: { 'user-agent': 'node.js' },
      })
        .then(response => {
          const users = response.data.items;
          this.process(users);
        })
        .catch(err => {
          console.log(err);
        });
    } else {
      console.log(`There is no city ${city}. Please enter valid city`);
    }
  }

  isValidSity(city) {
    return isNaN(Number(city)) && city.length <= 11;
  }

  process(users) {
    let repositories = users.map(user => {
      return axios({
        method: 'get',
        url: `https://api.github.com/search/repositories?q=user:${user.login}+language:javascript+stars:>=1+fork:true`,
        headers: { 'user-agent': 'node.js' },
      })
        .then(response => {
          return { 
            user: user.login, 
            repositories: response.data.items
          }
        })
        .catch(err => {
          console.log(err.response.data.message);
        });
    })

    Promise.all(repositories)
    .then(responses => {
      const popularity = responses.map(resp => {
        return this.calculateResult(resp.user, resp.repositories);
      });

      this.sortUsersByPopularity(popularity);
      this.printResult(popularity, 3);
    })
    .catch(err => {
      console.log(err);
    });
  }

  sortUsersByPopularity(users) {
    users.sort((a, b) => b.stars - a.stars);
  }

  calculateResult(user, repos) {
    let stars = 0;
    repos.forEach(repo => {
      stars += repo.stargazers_count;
    });

    return {
      stars,
      user
    };
  }

  printResult(users, num) {
    users.slice(0, num).forEach(usr => console.log(usr.user));
  }
}

const searcher = new MostRankedDevs();
searcher.search(city);
