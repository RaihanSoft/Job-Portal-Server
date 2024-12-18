const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express')
const cors = require('cors')
const app = express()
const port = process.env.PORT || 3000
require('dotenv').config()

//! database conntection 

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.khjiv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();
        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");


        //! 10 json data load in client with this
        const jobsCollection = client.db("job-portal").collection("jobs");
        const jobsApplicationsCollection = client.db("job-portal").collection("job-appllications");



        app.get('/jobs', async (req, res) => {
            const cursor = jobsCollection.find()
            const result = await cursor.toArray()
            res.send(result)

        })

        //! jobs details 
        app.get('/jobs/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await jobsCollection.findOne(query);
            res.send(result)

        })

        // ! job applications

        app.post('/job-applications', async (req, res) => {
            const applications = req.body;
            const result = await jobsApplicationsCollection.insertOne(applications)
            res.send(result)

        })
        // ! job applications get all data, get one data , get some data
        app.get('/job-application', async (req, res) => {
            const email = req.query.email;
            const query = { applicant_email: email }
            const result = await jobsApplicationsCollection.find(query).toArray()

            // !  not the best way
            for (const application of result) {
                console.log(application.job_id)

                const query = { _id: new ObjectId(application.job_id) };
                const job = await jobsCollection.findOne(query);
                if (job) {
                    application.title = job.title
                    application.company =job.company
                    application.company_logo = job.company_logo

                }

            }
            res.send(result)
        })







    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);

// !database conntection 


app.use(cors());
app.use(express.json())

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})