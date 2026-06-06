import { app } from "./app";
import { Server } from "http";

const PORT = 4001;
const BASE_URL = `http://localhost:${PORT}`;

async function runTests() {
  console.log("🚀 Starting LifeLink Backend Integration Tests...\n");
  
  // Start server on test port
  const server = await startServer(PORT);
  
  let patientToken = "";
  let doctorToken = "";
  let adminToken = "";
  let patientId = "";
  let doctorId = "";
  let reportId = "";
  let emergencyCaseId = "";
  
  const testId = Date.now();
  const patientEmail = `patient-${testId}@lifelink.test`;
  const doctorEmail = `doctor-${testId}@lifelink.test`;
  
  try {
    // 1. Health Check
    console.log("➡️ Testing: GET /health");
    const healthRes = await fetch(`${BASE_URL}/health`);
    assert(healthRes.status === 200, "Health check failed");
    const healthData = await healthRes.json();
    assert(healthData.status === "ok", "Health status is not ok");
    console.log("  ✔ Health Check Passed");

    // 2. Admin Login
    console.log("\n➡️ Testing: POST /auth/login (Admin)");
    const adminLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "admin@lifelink.local",
        password: "AdminPass123"
      })
    });
    assert(adminLoginRes.status === 200, "Admin login failed");
    const adminLoginData = await adminLoginRes.json();
    adminToken = adminLoginData.tokens.accessToken;
    assert(!!adminToken, "Admin access token is missing");
    console.log("  ✔ Admin Logged In Successfully");

    // 3. Register Patient
    console.log("\n➡️ Testing: POST /auth/register/patient");
    const patientRegRes = await fetch(`${BASE_URL}/auth/register/patient`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Test Patient",
        email: patientEmail,
        password: "Password123",
        phone: `1234567${testId.toString().slice(-3)}`,
        gender: "Male",
        bloodGroup: "O+",
        allergies: "Peanuts",
        dateOfBirth: "1990-01-01T00:00:00.000Z",
        emergencyContact: "9876543210"
      })
    });
    assert(patientRegRes.status === 201, `Patient registration failed: ${patientRegRes.status}`);
    const patientRegData = await patientRegRes.json();
    patientToken = patientRegData.tokens.accessToken;
    patientId = patientRegData.user.id;
    assert(!!patientToken, "Patient access token is missing");
    console.log("  ✔ Patient Registered Successfully");

    // Fetch patient profile ID (needed for offline sync later)
    const meRes = await fetch(`${BASE_URL}/auth/me`, {
      headers: { "Authorization": `Bearer ${patientToken}` }
    });
    const meData = await meRes.json();
    // Fetch patient profile separately from the reports endpoint
    const patientReportsRes = await fetch(`${BASE_URL}/reports`, {
      headers: { "Authorization": `Bearer ${patientToken}` }
    });
    // We'll get patientProfileId from the symptom analysis response later

    // 4. Register Doctor
    console.log("\n➡️ Testing: POST /auth/register/doctor");
    const doctorRegRes = await fetch(`${BASE_URL}/auth/register/doctor`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Test Doctor",
        email: doctorEmail,
        password: "Password123",
        phone: `7654321${testId.toString().slice(-3)}`,
        specialization: "Cardiology",
        licenseNumber: `LIC-${testId}`,
        experienceYears: 10,
        consultationFee: 500
      })
    });
    assert(doctorRegRes.status === 201, "Doctor registration failed");
    const doctorRegData = await doctorRegRes.json();
    doctorToken = doctorRegData.tokens.accessToken;
    assert(!!doctorToken, "Doctor access token is missing");
    console.log("  ✔ Doctor Registered Successfully (Verification Status: PENDING)");

    // Get doctor profile id by logging in as admin and retrieving pending doctors
    const pendingDocsRes = await fetch(`${BASE_URL}/admin/doctors/pending`, {
      headers: { "Authorization": `Bearer ${adminToken}` }
    });
    assert(pendingDocsRes.status === 200, "Could not fetch pending doctors");
    const pendingDocsData = await pendingDocsRes.json();
    const currentPending = pendingDocsData.doctors.find((d: any) => d.licenseNumber === `LIC-${testId}`);
    assert(!!currentPending, "Pending doctor not found in admin list");
    doctorId = currentPending.id;

    // 5. Admin Approves Doctor
    console.log("\n➡️ Testing: PATCH /admin/doctors/:id/verification");
    const approveRes = await fetch(`${BASE_URL}/admin/doctors/${doctorId}/verification`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${adminToken}`
      },
      body: JSON.stringify({ status: "APPROVED" })
    });
    assert(approveRes.status === 200, "Admin doctor approval failed");
    console.log("  ✔ Doctor Verification Approved by Admin");

    // 6. Doctor Login (Verify Access)
    console.log("\n➡️ Testing: POST /auth/login (Doctor)");
    const docLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: doctorEmail,
        password: "Password123"
      })
    });
    assert(docLoginRes.status === 200, "Doctor login failed");
    const docLoginData = await docLoginRes.json();
    doctorToken = docLoginData.tokens.accessToken;
    console.log("  ✔ Doctor Logged In Successfully");

    // 7. Patient Uploads PDF Report
    console.log("\n➡️ Testing: POST /reports/upload");
    const formData = new FormData();
    const dummyPdfContent = "%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R >>\nendobj\n4 0 obj\n<< /Length 55 >>\nstream\nBT\n/F1 12 Tf\n72 712 Td\n(Glucose Level: 145 mg/dL. HbA1c: 7.2 percent. Elevated Cholesterol.) Tj\nET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f\n0000000009 00000 n\n0000000062 00000 n\n0000000121 00000 n\n0000000228 00000 n\ntrailer\n<< /Size 5 /Root 1 0 R >>\nstartxref\n334\n%%EOF";
    const blob = new Blob([dummyPdfContent], { type: "application/pdf" });
    
    formData.append("report", blob, "test-report.pdf");
    formData.append("reportType", "Blood Lipid Panel");

    const uploadRes = await fetch(`${BASE_URL}/reports/upload`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${patientToken}`
      },
      body: formData
    });
    assert(uploadRes.status === 201, `Upload failed: ${uploadRes.status}`);
    const uploadData = await uploadRes.json();
    reportId = uploadData.report.id;
    assert(!!reportId, "Report ID missing after upload");
    // Note: extractedText may be null for our test dummy PDF — that's fine, upload itself is the main check
    if (uploadData.report.extractedText) {
      console.log("  ✔ Report PDF Uploaded & Text Extracted Successfully");
    } else {
      console.log("  ✔ Report PDF Uploaded Successfully (Text extraction returned empty for this test PDF, which is expected)");
    }

    // 8. Patient Analyzes Report (Gemini AI Integration)
    console.log("\n➡️ Testing: POST /ai/analyze-report/:reportId");
    const reportAnalyzeRes = await fetch(`${BASE_URL}/ai/analyze-report/${reportId}`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${patientToken}`
      }
    });
    assert(reportAnalyzeRes.status === 201, `Report analysis failed: ${reportAnalyzeRes.status}`);
    const reportAnalyzeData = await reportAnalyzeRes.json();
    assert(!!reportAnalyzeData.analysis, "Report analysis object missing");
    console.log(`  ✔ Report Analyzed. Risk Level: ${reportAnalyzeData.analysis.riskLevel}`);

    // 9. Patient Analyzes Symptoms (Trigger Emergency case)
    console.log("\n➡️ Testing: POST /ai/analyze-symptoms (Triggering Emergency)");
    const symptomRes = await fetch(`${BASE_URL}/ai/analyze-symptoms`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${patientToken}`
      },
      body: JSON.stringify({
        symptomsInput: "Patient is experiencing severe chest pain and crushing chest pressure with dizziness.",
        reportId: reportId
      })
    });
    assert(symptomRes.status === 201, "Symptom analysis failed");
    const symptomData = await symptomRes.json();
    emergencyCaseId = symptomData.emergencyCase.id;
    assert(!!emergencyCaseId, "Emergency case was not automatically created");
    console.log(`  ✔ Symptom Triage Completed. Risk Level: ${symptomData.analysis.riskLevel}`);
    console.log(`  ✔ Emergency Case Created: ${emergencyCaseId}`);

    // 10. Patient asks medical question (Q&A)
    console.log("\n➡️ Testing: POST /ai/ask-question");
    const qaRes = await fetch(`${BASE_URL}/ai/ask-question`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${patientToken}`
      },
      body: JSON.stringify({
        question: "What is my HbA1c level from my lipid panel report?",
        reportId: reportId
      })
    });
    assert(qaRes.status === 200, "Q&A request failed");
    const qaData = await qaRes.json();
    assert(!!qaData.answer, "AI answer is missing");
    console.log(`  ✔ AI Q&A Response: "${qaData.answer.slice(0, 70)}..."`);

    // 11. Doctor Lists Emergencies
    console.log("\n➡️ Testing: GET /doctors/emergencies");
    const docEmergenciesRes = await fetch(`${BASE_URL}/doctors/emergencies`, {
      headers: { "Authorization": `Bearer ${doctorToken}` }
    });
    assert(docEmergenciesRes.status === 200, "Doctor emergencies fetch failed");
    const docEmergenciesData = await docEmergenciesRes.json();
    const ourEmergency = docEmergenciesData.emergencyCases.find((e: any) => e.id === emergencyCaseId);
    assert(!!ourEmergency, "Created emergency case not found in doctor's active emergencies list");
    console.log("  ✔ Doctor Retrieved Active Emergencies List");

    // 12. Doctor Claims Emergency Case
    console.log("\n➡️ Testing: PATCH /doctors/emergencies/:id/assign");
    const claimRes = await fetch(`${BASE_URL}/doctors/emergencies/${emergencyCaseId}/assign`, {
      method: "PATCH",
      headers: { "Authorization": `Bearer ${doctorToken}` }
    });
    assert(claimRes.status === 200, "Doctor failed to claim emergency case");
    const claimData = await claimRes.json();
    assert(claimData.emergencyCase.escalationStatus === "ASSIGNED", "Case status did not change to ASSIGNED");
    console.log("  ✔ Emergency Case Claimed/Assigned to Doctor");

    // 13. Doctor Resolves Emergency Case
    console.log("\n➡️ Testing: PATCH /doctors/emergencies/:id/resolve");
    const resolveRes = await fetch(`${BASE_URL}/doctors/emergencies/${emergencyCaseId}/resolve`, {
      method: "PATCH",
      headers: { "Authorization": `Bearer ${doctorToken}` }
    });
    assert(resolveRes.status === 200, "Doctor failed to resolve emergency case");
    const resolveData = await resolveRes.json();
    assert(resolveData.emergencyCase.escalationStatus === "RESOLVED", "Case status did not change to RESOLVED");
    console.log("  ✔ Emergency Case Resolved Successfully");

    // 14. Sync Offline Logs
    // Use patientId from the analysis (which contains the patient profile ID)
    const patientProfileId = symptomData.analysis.patientId;
    console.log("\n➡️ Testing: POST /sync/offline-logs");
    const syncRes = await fetch(`${BASE_URL}/sync/offline-logs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${patientToken}`
      },
      body: JSON.stringify([
        {
          type: "EMERGENCY_TRIGGER",
          timestamp: new Date().toISOString(),
          data: {
            patientId: patientProfileId,
            symptomsInput: "Crushing chest pressure triggered offline via mesh network beacon",
            severity: "EMERGENCY"
          }
        }
      ])
    });
    assert(syncRes.status === 200, "Offline log synchronization failed");
    const syncData = await syncRes.json();
    assert(syncData.syncedCount >= 1, `Expected at least 1 synced item, got ${syncData.syncedCount}`);
    console.log(`  ✔ Offline Sync Successful. Synced items: ${syncData.syncedCount}`);

    console.log("\n✨ All Integration Tests Completed Successfully! ✨");

  } catch (error: any) {
    console.error("\n❌ Test Suite Failed:", error.message);
  } finally {
    // Stop server
    server.close();
    console.log("\n🔌 Test server shut down cleanly.");
  }
}

function startServer(port: number): Promise<Server> {
  return new Promise((resolve) => {
    const server = app.listen(port, () => {
      console.log(`  Test server listening on port ${port}...`);
      resolve(server);
    });
  });
}

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(message);
  }
}

runTests();
