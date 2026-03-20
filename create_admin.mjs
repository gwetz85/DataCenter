const apiKey = "AIzaSyCfdD3EZMC-ULUrMElw5BmTvJXV2KSvYiE";
const projectId = "data-centre-598dd";
const username = "AGUS";
const email = "agus@datacenter.com";
const password = "@Agustus2";

async function run() {
  console.log(`Creating Admin user: ${email}...`);
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
  
  if (authData.error && authData.error.message === "EMAIL_EXISTS") {
      console.log("User already exists, fetching UID via sign-in...");
      const signInRes = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, returnSecureToken: true })
      });
      const signInData = await signInRes.json();
      uid = signInData.localId;
  }

  console.log("Auth UID:", uid);
  
  console.log("Creating user profile in Firestore...");
  const docRes = await fetch(`https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/users/${uid}?key=${apiKey}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fields: {
        name: { stringValue: username },
        email: { stringValue: email },
        role: { stringValue: "Admin" },
        status: { stringValue: "active" }
      }
    })
  });
  
  if (!docRes.ok) {
     const errText = await docRes.text();
     console.error("Firestore Error:", errText);
     return;
  }
  
  console.log("SuperAdmin AGUS has been successfully seeded!");
}

run();
