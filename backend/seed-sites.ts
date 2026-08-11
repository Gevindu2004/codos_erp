import { db } from './src/firebase/admin';

const sriLankaSites = [
  {
    name: "Colombo Main Branch",
    addressLine1: "123 Galle Road",
    city: "Colombo",
    state: "Western Province",
    zipCode: "00300",
    country: "Sri Lanka",
    notes: "Main headquarters in Colombo"
  },
  {
    name: "Kandy Branch",
    addressLine1: "45 Peradeniya Road",
    city: "Kandy",
    state: "Central Province",
    zipCode: "20000",
    country: "Sri Lanka",
    notes: "Branch near the lake"
  },
  {
    name: "Galle Fort Branch",
    addressLine1: "10 Church Street",
    city: "Galle",
    state: "Southern Province",
    zipCode: "80000",
    country: "Sri Lanka",
    notes: "Inside the historic Galle Fort"
  }
];

async function seedSites() {
  try {
    // Get all clients to find "Salon Oski"
    const clientsSnapshot = await db.collection('clients').get();
    if (clientsSnapshot.empty) {
      console.log('No clients found in database.');
      return;
    }

    let targetClient: any = null;
    clientsSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.name && data.name.includes('Salon Oski')) {
        targetClient = { id: doc.id, ...data };
      }
    });

    if (!targetClient) {
      console.log('Could not find Salon Oski, using the first client available.');
      targetClient = { id: clientsSnapshot.docs[0].id, ...clientsSnapshot.docs[0].data() };
    }

    console.log(`Adding Sri Lanka sites to client: ${targetClient.name} (${targetClient.id})`);

    const batch = db.batch();
    const sitesCollection = db.collection(`clients/${targetClient.id}/sites`);

    for (const site of sriLankaSites) {
      const docRef = sitesCollection.doc();
      batch.set(docRef, {
        ...site,
        clientId: targetClient.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      console.log(`Prepared site: ${site.name}`);
    }

    await batch.commit();
    console.log('Successfully added Sri Lanka sites!');
  } catch (err) {
    console.error('Error seeding sites:', err);
  }
}

seedSites();
