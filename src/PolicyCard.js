import React, { useState } from "react";
import Card from "react-bootstrap/Card";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";

function PolicyCard(props) {
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  return (
    <>
      <Card className="mx-1 my-2">
        <Card.Body>
          <div className="d-flex">
            <Card.Title className="text-capitalize">
              {props.policy.name}
            </Card.Title>
          </div>
          <Card.Text className="sentence-capitalize">
            {props.policy.description}
          </Card.Text>

          <PolicyGraph policy={props.policy} />
        </Card.Body>

        <Modal.Footer>
          <div className="d-flex justify-content-between align-items-center w-100">
            <div className="d-inline-flex gap-1">
              {window.tagLinks[props.policy.id].map((tagId) => (
                <span
                  key={tagId}
                  className="badge rounded-pill bg-light text-dark pointer"
                >
                  {window.tags[tagId]}
                </span>
              ))}
            </div>
            <Button variant="light" onClick={handleShow}>
              Divisions
            </Button>
          </div>
        </Modal.Footer>
      </Card>

      <DivisionModal
        divisions={props.policy.policy_divisions}
        policy={props.policy}
        handleClose={handleClose}
        handleShow={handleShow}
        show={show}
      ></DivisionModal>
    </>
  );
}

function DivisionModal(props) {
  return (
    <Modal show={props.show} onHide={props.handleClose}>
      <Modal.Header closeButton>
        <Modal.Title className="text-capitalize">
          {props.policy.name}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {props.divisions.map((e) => (
          <div key={e.division.id}>
            <p className="text-capitalize mb-0">
              <strong>{e.division.name}</strong>
            </p>
            <a
              href={`https://theyvoteforyou.org.au/divisions/${e.division.house}/${e.division.date}/${e.division.number}`}
              target="blank"
              rel="noreferrer"
            >
              https://theyvoteforyou.org.au/divisions/
              {e.division.house}/{e.division.date}/{e.division.number}
            </a>
            <p className="m-0 text-capitalize text-muted">
              <em>
                {e.division.house} - {e.division.date}
              </em>
            </p>
            <p className="m-0">Aye Votes: {e.division.aye_votes}</p>
            <p>No Votes: {e.division.no_votes}</p>
            <br></br>
          </div>
        ))}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={props.handleClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

class PolicyGraph extends React.Component {
  constructor(props) {
    super(props);

    let data = {};

    for (let party of window.parties) {
      data[party.name] = {
        agreement_sum: 0,
        people: [],
      };
    }

    for (let member of props.policy.people_comparisons) {
      let json = window.people[member.id];
      let party = json.person.latest_member.party;

      if (!data[party]) continue;

      data[party].agreement_sum += parseFloat(member.agreement);
      data[party].people.push({ person: json.person, member: member });
    }

    let parties = window.parties.filter(
      (party) => data[party.name].people.length
    );

    this.state = {
      parties: parties,
      data: data,
      show: false,
      people: data[parties[0].name],
    };

    this.handleShow = this.handleShow.bind(this);
    this.handleClose = this.handleClose.bind(this);
  }

  handleShow(party) {
    this.setState({
      show: true,
      people: this.state.data[party],
    });
  }

  handleClose() {
    this.setState({ show: false });
  }

  render() {
    return (
      <>
        <div className="d-flex pb-2 grey-underline-divider">
          <div style={{ flexBasis: "132px" }}></div>
          <div className="w-100 text-center d-flex justify-content-around">
            <div>Disagree</div>
            <div>Agree</div>
          </div>
          <div
            className=" d-flex justify-content-center"
            style={{ flexBasis: "80px" }}
          >
            MPs
          </div>
        </div>
        {this.state.parties.map((party) => (
          <div
            key={party.name}
            className="d-flex align-items-center grey-underline-divider"
          >
            <div
              className="d-flex align-items-center justify-content-end"
              style={{ flexBasis: "132px" }}
            >
              <div className="graph-label-font">{party.short}</div>
            </div>

            <div className="w-100 px-2 d-flex">
              <GraphBarLeft data={this.state.data[party.name]} party={party} />
              <GraphBarRight data={this.state.data[party.name]} party={party} />
            </div>
            <div
              className=" d-flex justify-content-center"
              style={{ flexBasis: "80px" }}
            >
              <button
                className="btn btn-link p-0 text-decoration-none"
                onClick={() => this.handleShow(party.name)}
              >
                {this.state.data[party.name].people.length}
              </button>
            </div>
          </div>
        ))}
        <div className="d-flex">
          <div style={{ flexBasis: "124px" }}></div>
          <div className="w-100 px-2 pt-1 d-flex justify-content-between graph-label-font">
            <span>0</span>
            <span>25</span>
            <span>50</span>
            <span>75</span>
            <span>100</span>
          </div>
          <div style={{ flexBasis: "64px" }}></div>
        </div>
        <div className="d-flex">
          <div style={{ flexBasis: "124px" }}></div>
          <div className="w-100 text-center graph-label-font pt-1">
            No/Yes Percentage
          </div>
          <div style={{ flexBasis: "64px" }}></div>
        </div>

        <PeopleModal
          people={this.state.people}
          policy={this.props.policy}
          handleClose={this.handleClose}
          handleShow={this.handleShow}
          show={this.state.show}
        ></PeopleModal>
      </>
    );
  }
}

function PeopleModal(props) {
  let partyName = props.people.people[0].person.latest_member.party;
  let party = window.parties.find((e) => e.name === partyName);

  return (
    <Modal show={props.show} onHide={props.handleClose}>
      <Modal.Header closeButton>
        <Modal.Title className="text-capitalize">
          {props.policy.name}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <h5
          className="mb-3"
          style={{
            textDecoration: "underline",
            textDecorationColor: party.color,
            textDecorationThickness: "4px",
          }}
        >
          {partyName}
        </h5>
        <div className="d-flex justify-content-between fw-bold">
          <p>MP</p>
          <p>Agreement Rate</p>
        </div>

        {props.people.people.map((e) => (
          <div className="d-flex justify-content-between">
            <p key={e.person.latest_member.id}>
              {e.person.latest_member.name.first}{" "}
              {e.person.latest_member.name.last}:
            </p>
            <p>{e.member.agreement}%</p>
          </div>
        ))}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={props.handleClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

function GraphBarLeft(props) {
  let agreement = props.data.agreement_sum;
  let votes = props.data.people.length;
  let percentage = agreement / votes;
  let width = 100 - (agreement / votes) * 2;

  let child =
    percentage >= 50 ? (
      <div className="px-1 graph-label-font">{percentage.toFixed(1) + "%"}</div>
    ) : (
      <div
        style={{
          height: "16px",
          width: width + "%",
          backgroundColor: props.party.color,
        }}
      ></div>
    );

  return (
    <div className="w-50 d-flex justify-content-end align-items-center">
      {child}
    </div>
  );
}

function GraphBarRight(props) {
  let agreement = props.data.agreement_sum;
  let votes = props.data.people.length;
  let percentage = agreement / votes;
  let width = (agreement / votes - 50) * 2;

  let child =
    percentage < 50 ? (
      <div className="px-1 graph-label-font">{percentage.toFixed(1) + "%"}</div>
    ) : (
      <div
        style={{
          height: "16px",
          width: width + "%",
          backgroundColor: props.party.color,
        }}
      ></div>
    );

  return (
    <div className="w-50 d-flex justify-content-start align-items-center">
      {child}
    </div>
  );
}

export default PolicyCard;
