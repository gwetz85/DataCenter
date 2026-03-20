const apiKey = "AIzaSyCfdD3EZMC-ULUrMElw5BmTvJXV2KSvYiE";
const databaseURL = "https://data-centre-598dd-default-rtdb.firebaseio.com";
const username = "AGUS";
const email = "agus@datacenter.com";
const password = "@Agustus2";

async function run() {
  console.log(`Creating Admin user: ${username}...`);
  const authRes = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, returnSecureToken: true })
  });
  const authData = await authRes.json();
  
  if (authData.error && authData.error.message !== "EMAIL_EXISTS") {
    console.error("Auth Error:", authData.error);
    return;
  }
  
  let uid = authData.localId;
  let idToken = authData.idToken;
  
  if (authData.error && authData.error.message === "EMAIL_EXISTS") {
      console.log("User already exists, fetching UID via sign-in...");
      const signInRes = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, returnSecureToken: true })
      });
      const signInData = await signInRes.json();
      uid = signInData.localId;
      idToken = signInData.idToken;
  }

  console.log("Auth UID:", uid);
  
  console.log("Creating user profile in Realtime Database...");
  // Use PUT to initialize/overwrite the node
  const docRes = await fetch(`${databaseURL}/users/${uid}.json?auth=${idToken}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: username,
      email: email, // or keep it empty if we abstract away email
      role: "Admin",
      status: "active"
    })
  });
  
  if (!docRes.ok) {
     const errText = await docRes.text();
     console.error("Realtime DB Error:", errText);
     return;
  }
  
  const docData = await docRes.json();
  console.log("Realtime DB Write Result:", docData);
  console.log("SuperAdmin AGUS has been successfully seeded!");
}

run();
