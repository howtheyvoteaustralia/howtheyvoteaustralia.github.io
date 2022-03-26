import React from "react";
import PolicyCard from "./PolicyCard";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Container from "react-bootstrap/Container";
import "./App.css";

class App extends React.Component {
  constructor(props) {
    super(props);

    let policyIds = [];
    for (let i = 0; i < window.policies.length; i++) {
      policyIds.push(i);
    }

    policyIds.sort(() => Math.random() - 0.5);

    let policies = [];
    for (let i = 0; i < 10; i++) {
      policies.push(window.policies[policyIds.pop()]);
    }

    this.state = {
      policyIds: policyIds,
      policies: policies,
      query: "",
      tag: null,
    };

    this.loadMore = this.loadMore.bind(this);
    this.onSearch = this.onSearch.bind(this);
    this.filterByTag = this.filterByTag.bind(this);
    this.removeTag = this.removeTag.bind(this);
  }

  removeTag(tag) {
    this.setState({
      query: "",
      tag: null,
      policies: [],
    });
  }

  filterByTag(tag) {
    let matches = window.policies.filter((policy) => {
      for (let tagId of window.tagLinks[policy.id]) {
        if (tagId === tag) {
          return true;
        }
      }

      return false;
    });

    this.setState({
      tag: tag,
      query: "",
      policies: matches,
    });
  }

  onSearch(event) {
    let query = event.target.value;

    if (!query) {
      this.setState({
        query: query,
        policies: [],
        tag: null,
      });
      return;
    }

    let matches = window.policies.filter((policy) => {
      let regex = new RegExp("\\b" + query.toLowerCase(), "g");
      return regex.test(policy.name.toLowerCase());
    });

    matches.sort((first, second) => {
      let firstIndex = first.name.toLowerCase().indexOf(query.toLowerCase());
      let secondIndex = second.name.toLowerCase().indexOf(query.toLowerCase());

      return firstIndex - secondIndex;
    });

    this.setState({
      query: query,
      tag: null,
      policies: matches,
    });
  }

  loadMore() {
    let policies = this.state.policies;
    let policyIds = this.state.policyIds;

    for (let i = 0; i < (policyIds.length > 10 ? 10 : policyIds.length); i++) {
      policies.push(window.policies[policyIds.pop()]);
    }

    this.setState({
      policies: policies,
      policyIds: policyIds,
    });
  }

  render() {
    return (
      <>
        <div className="bg-light py-3">
          <Container>
            <h3>HOW THEY VOTE</h3>
            <p>
              Data from{" "}
              <a
                href="https://theyvoteforyou.org.au/"
                target="_blank"
                rel="noreferrer"
              >
                theyvoteforyou.org.au
              </a>{" "}
              organised into their political parties.
            </p>
          </Container>
        </div>

        <div className="App container">
          <header className="App-header">
            <Form.Group className="mt-3 mb-1" controlId="formBasicEmail">
              <Form.Control
                type="email"
                placeholder="Search"
                value={this.state.query}
                onChange={this.onSearch}
              />
            </Form.Group>
            <TagFilters
              filterByTag={this.filterByTag}
              removeTag={this.removeTag}
              tag={this.state.tag}
            />
          </header>
          <main>
            <div>
              {this.state.policies.map((policy) => (
                <PolicyCard key={policy.id} policy={policy} />
              ))}
            </div>
            {this.state.policyIds.length > 0 &&
              !this.state.query &&
              !this.state.tag && (
                <div className="text-center p-4">
                  <Button
                    variant="btn btn-outline-secondary"
                    onClick={this.loadMore}
                  >
                    Load More
                  </Button>
                </div>
              )}
          </main>
        </div>
      </>
    );
  }
}

function TagFilters(props) {
  return (
    <div className="mb-3 d-inline-flex gap-1 flex-wrap">
      {window.tags.map((tag, index) =>
        props.tag === index ? (
          <span
            value={index}
            onClick={() => props.removeTag(index)}
            key={tag}
            className="badge rounded-pill text-light bg-dark pointer"
          >
            {tag}
          </span>
        ) : (
          <span
            value={index}
            onClick={() => props.filterByTag(index)}
            key={tag}
            className="badge rounded-pill bg-light text-dark pointer"
          >
            {tag}
          </span>
        )
      )}
    </div>
  );
}

export default App;
