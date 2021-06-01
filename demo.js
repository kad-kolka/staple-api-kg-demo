const express = require("express");
const { ApolloServer } = require("apollo-server-express");
const staple = require("staple-api");

const ontology = {
    file: "./docs/ontology.ttl" 
};

const config = {
dataSources: {
    default: "sourceName",
    sourceName: {
      type: "sparql",
      url: " https://api.labs.kadaster.nl/datasets/kadaster/bag2/services/default/sparql", 
      graphName: "https://bag2.basisregistraties.overheid.nl/bag/graphs/instanties",
      description: "BAG2 Graph"
    }};

async function Demo() {
    
    // creating an instance of Staple API

    const stapleApi = await staple(ontology, config);
    const schema = stapleApi.schema;
  
    // creating the list of all people and their names for FE indexing

    let people = []

    console.log("Fetching people's names...")
    await stapleApi.graphql('{ Person { _id label } }').then((response) => {
        response.data.Person.forEach(element => {
            people.push({id: element._id, text:element.label})
        });
        console.log("...all fetched!")
        });


    // exnabling FE, Staple API and people endpoint via express server

    const app = express();
    
    app.use(express.static("docs"))

    app.get('/people', function (req, res) {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.send(people)
      })

    const server = new ApolloServer({
        schema
    });

    const path = "/graphql";
    server.applyMiddleware({ app, path });

    app.listen({ port: 5000 }, () =>
        console.log("🚀 Server ready")
    );
}

Demo()
