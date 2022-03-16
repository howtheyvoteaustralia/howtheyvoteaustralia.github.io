const fs = require("fs").promises;
const fetch = require("node-fetch");

const theyVoteForYouKey = ""; /* YOUR KEY HERE */

async function getPolicies() {
  let policiesReponse = await fetch(
    "https://theyvoteforyou.org.au/api/v1/policies.json?key=" +
      theyVoteForYouKey
  );
  let policies = await policiesReponse.json();

  let json = [];

  for (let key in policies) {
    if (policies[key].provisional) continue;

    let fullPolicy = await fetch(
      "https://theyvoteforyou.org.au/api/v1/policies/" +
        policies[key].id +
        ".json?key=" +
        theyVoteForYouKey
    );
    json.push(await fullPolicy.json());
    console.log(policies[key].name);
  }

  await fs.writeFile("./json/policies.json", JSON.stringify(json, null, 2));
  console.log("written policies");
}

async function getPeopleFromPolicies() {
  let policiesFile = await fs.readFile("./json/policies.json", "utf8");
  let policiesJSON = JSON.parse(policiesFile);
  let json = {};

  for (let policy of policiesJSON) {
    for (let comparison of policy.people_comparisons) {
      delete comparison.agreement;
      delete comparison.voted;
      json[comparison.person.id] = comparison;
    }
  }

  await fs.writeFile(
    "./json/people_from_policies.json",
    JSON.stringify(json, null, 2)
  );
  console.log("written getPeopleFromPolicies");
}

async function getParties() {
  let peopleFile = await fs.readFile(
    "./json/people_from_policies.json",
    "utf8"
  );
  let peopleJSON = JSON.parse(peopleFile);
  let set = new Set();

  for (let pk in peopleJSON) {
    let party = peopleJSON[pk].person.latest_member.party;
    set.add(party);
  }

  await fs.writeFile(
    "./json/parties.json",
    JSON.stringify(Array.from(set), null, 2)
  );
  console.log("written parties");
}

async function filterPolicies() {
  let policiesFile = await fs.readFile("./json/policies.json", "utf8");

  let policies = JSON.parse(policiesFile).filter((policy) => {
    return !policy.provisional;
  });

  for (let pk in policies) {
    delete policies[pk].provisional;
    delete policies[pk].last_edited_at;
    delete policies[pk].provisional;

    for (let key in policies[pk].people_comparisons) {
      policies[pk].people_comparisons[key].id =
        policies[pk].people_comparisons[key].person.id;
      delete policies[pk].people_comparisons[key].person;
    }
  }

  await fs.writeFile(
    "./json/trimed_policies.json",
    JSON.stringify(policies, null, 2)
  );

  console.log("trimmed policy data");
}

async function main() {
  // await getPolicies();
  // await getPeopleFromPolicies();
  // await getParties();
  await filterPolicies();
}

main();
