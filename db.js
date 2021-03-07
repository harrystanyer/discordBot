const { MongoClient } = require('mongodb');
require('dotenv').config();

async function main(){
    const uri = process.env.MONGO_URI;

    const client = new MongoClient(uri);

    var json = {
        type: "post",
        content: "Yooo, this is the best message I've ever sent.",
        dateTime: "07/03/2021",
        active: true
    };

    var multiJson = [
        {
            name: "Infinite Views",
            summary: "Modern home with infinite views from the infinity pool",
            property_type: "House",
            bedrooms: 5,
            bathrooms: 4.5,
            beds: 5
        },
        {
            name: "Private room in London",
            property_type: "Apartment",
            bedrooms: 1,
            bathroom: 1
        },
        {
            name: "Beautiful Beach House",
            summary: "Enjoy relaxed beach living in this house with a private beach",
            bedrooms: 4,
            bathrooms: 2.5,
            beds: 7,
            last_review: new Date()
        }
    ];

    try {
        // Connect to the MongoDB cluster
        await client.connect();

        // Make the appropriate DB calls
        //await  listDatabases(client);
        //await createListing(client, json);
        //await createMultipleListings(client, multiJson);
        //await findOneListingByName(client, "Private room in London");
        /*await findListingsWithMinimumBedroomsBathroomsAndMostRecentReviews(client, {
            minimumNumberOfBedrooms: 4,
            minimumNumberOfBathrooms: 2,
            maximumNumberOfResults: 5
        });*/
        //await updateListingByName(client, "Infinite Views", { bedrooms: 6, beds: 8 });
        //await updateAllListingsToHavePropertyType(client);
        //await deleteListingByName(client, "Cozy Cottage");
        await deleteListingsScrapedBeforeDate(client, new Date("2019-02-15"));
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
}

async function listDatabases(client){
    databasesList = await client.db().admin().listDatabases();
    console.log("Databases:");
    databasesList.databases.forEach(db => console.log(` - ${db.name}`));
};

async function createListing(client, newListing){
    const result = await client.db("databaseTest").collection("main").insertOne(newListing);
    console.log(`New listing created with the following id: ${result.insertedId}`);
}

async function createMultipleListings(client, newListings){
    const result = await client.db("databaseTest").collection("main").insertMany(newListings);
    console.log(`${result.insertedCount} new listing(s) created with the following id(s):`);
    console.log(result.insertedIds);
}

async function findOneListingByName(client, nameOfListing) {
    const result = await client.db("databaseTest").collection("main").findOne({ name: nameOfListing });
    if (result) {
        console.log(`Found a listing in the collection with the name '${nameOfListing}':`);
        console.log(result);
    } else {
        console.log(`No listings found with the name '${nameOfListing}'`);
    }
}

async function findListingsWithMinimumBedroomsBathroomsAndMostRecentReviews(client, {
    minimumNumberOfBedrooms = 0,
    minimumNumberOfBathrooms = 0,
    maximumNumberOfResults = Number.MAX_SAFE_INTEGER
} = {}) {
    const cursor = client.db("databaseTest").collection("main").find(
                            {
                                bedrooms: { $gte: minimumNumberOfBedrooms },
                                bathrooms: { $gte: minimumNumberOfBathrooms }
                            }
                            ).sort({ last_review: -1 })
                            .limit(maximumNumberOfResults);
    const results = await cursor.toArray();
    if (results.length > 0) {
        console.log(`Found listing(s) with at least ${minimumNumberOfBedrooms} bedrooms and ${minimumNumberOfBathrooms} bathrooms:`);
        results.forEach((result, i) => {
            date = new Date(result.last_review).toDateString();
            console.log();
            console.log(`${i + 1}. name: ${result.name}`);
            console.log(`   _id: ${result._id}`);
            console.log(`   bedrooms: ${result.bedrooms}`);
            console.log(`   bathrooms: ${result.bathrooms}`);
            console.log(`   most recent review date: ${new Date(result.last_review).toDateString()}`);
        });
    } else {
        console.log(`No listings found with at least ${minimumNumberOfBedrooms} bedrooms and ${minimumNumberOfBathrooms} bathrooms`);
    }
}

async function updateListingByName(client, nameOfListing, updatedListing) {
    const result = await client.db("databaseTest").collection("main")
                        .updateOne({ name: nameOfListing }, { $set: updatedListing });
    console.log(`${result.matchedCount} document(s) matched the query criteria.`);
    console.log(`${result.modifiedCount} document(s) was/were updated.`);
}

async function updateAllListingsToHavePropertyType(client) {
    const result = await client.db("databaseTest").collection("main")
                        .updateMany({ property_type: { $exists: false } },
                                    { $set: { property_type: "Unknown" } });
    console.log(`${result.matchedCount} document(s) matched the query criteria.`);
    console.log(`${result.modifiedCount} document(s) was/were updated.`);
}

async function deleteListingByName(client, nameOfListing) {
    const result = await client.db("databaseTest").collection("main")
            .deleteOne({ name: nameOfListing });
    console.log(`${result.deletedCount} document(s) was/were deleted.`);
}

async function deleteListingsScrapedBeforeDate(client, date) {
    const result = await client.db("databaseTest").collection("main")
        .deleteMany({ "last_scraped": { $lt: date } });
    console.log(`${result.deletedCount} document(s) was/were deleted.`);
}

main().catch(console.error);