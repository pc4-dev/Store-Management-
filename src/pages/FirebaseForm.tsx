import React, { useState, useEffect } from "react";
import { collection, addDoc, getDocs, query, orderBy, Timestamp } from "firebase/firestore";
import { db } from "../firebase";
import { PageHeader, Card, Btn, Field, StatusBadge } from "../components/ui";
import { Send, RefreshCw, AlertCircle } from "lucide-react";

interface FormData {
  id: string;
  name: string;
  email: string;
  message: string;
  createdAt: any;
}

export const FirebaseForm = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [submissions, setSubmissions] = useState<FormData[]>([]);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSubmissions = async () => {
    // --- GET DATA FROM FIREBASE (FETCH) ---
    setFetching(true);
    setError(null);
    try {
      // Create a query to get documents from the "form_submissions" collection
      const q = query(collection(db, "form_submissions"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      
      // Map the query results to our local state
      const data = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as FormData[];
      
      setSubmissions(data);
    } catch (err: any) {
      console.error("Error fetching submissions:", err);
      setError("Failed to fetch submissions. Check your Firebase config and rules.");
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;

    // --- SAVE DATA TO FIREBASE (POST) ---
    setLoading(true);
    setError(null);
    try {
      // Add a new document to the "form_submissions" collection
      await addDoc(collection(db, "form_submissions"), {
        name,
        email,
        message,
        createdAt: Timestamp.now()
      });
      
      // Reset form fields
      setName("");
      setEmail("");
      setMessage("");
      
      alert("Form submitted successfully!");
      
      // Refresh the list to show the new entry
      fetchSubmissions();
    } catch (err: any) {
      console.error("Error adding document:", err);
      setError("Failed to submit form. Check your Firebase config and rules.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Firebase Form Data" 
        sub="Store and retrieve website form data permanently using Firestore"
        actions={
          <Btn 
            label="Refresh Data" 
            icon={RefreshCw} 
            outline 
            onClick={fetchSubmissions} 
            disabled={fetching}
          />
        }
      />

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700 text-sm">
          <AlertCircle className="w-5 h-5" />
          <p>{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Section */}
        <Card className="p-6 lg:col-span-1">
          <h2 className="text-lg font-bold text-[#1A1A2E] mb-4">Submit New Entry</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Field 
              label="Full Name" 
              value={name} 
              onChange={(e: any) => setName(e.target.value)} 
              placeholder="John Doe"
              required
            />
            <Field 
              label="Email Address" 
              type="email"
              value={email} 
              onChange={(e: any) => setEmail(e.target.value)} 
              placeholder="john@example.com"
              required
            />
            <div className="mb-4">
              <label className="block text-[11px] font-bold text-[#6B7280] uppercase tracking-wider mb-1">
                Message
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-3 py-2 border border-[#E8ECF0] rounded-lg text-[13px] focus:outline-none focus:border-[#F97316] focus:ring-1 focus:ring-[#F97316]"
                rows={4}
                placeholder="Type your message here..."
                required
              />
            </div>
            <Btn 
              label={loading ? "Submitting..." : "Submit to Firestore"} 
              icon={Send} 
              className="w-full" 
              disabled={loading}
            />
          </form>
        </Card>

        {/* Submissions List */}
        <Card className="lg:col-span-2 overflow-hidden">
          <div className="px-6 py-4 border-b border-[#E8ECF0] flex justify-between items-center">
            <h2 className="text-lg font-bold text-[#1A1A2E]">Recent Submissions</h2>
            <span className="text-[11px] font-bold text-[#6B7280] uppercase bg-gray-100 px-2 py-1 rounded-full">
              {submissions.length} Entries
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-[#E8ECF0]">
                  <th className="px-6 py-3 text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">Message</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8ECF0]">
                {submissions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 text-[13px] text-[#6B7280] whitespace-nowrap">
                      {sub.createdAt?.toDate ? sub.createdAt.toDate().toLocaleDateString() : "N/A"}
                    </td>
                    <td className="px-6 py-4 text-[13px] font-medium text-[#1A1A2E]">{sub.name}</td>
                    <td className="px-6 py-4 text-[13px] text-[#6B7280]">{sub.email}</td>
                    <td className="px-6 py-4 text-[13px] text-[#6B7280] max-w-xs truncate">{sub.message}</td>
                  </tr>
                ))}
                {submissions.length === 0 && !fetching && (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500 text-[13px]">
                      No submissions found. Submit the form to see data here.
                    </td>
                  </tr>
                )}
                {fetching && (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500 text-[13px]">
                      Loading submissions...
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Sync Status Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { name: "Inventory", coll: "inventory", id: "SKU" },
          { name: "Catalogue", coll: "catalogue", id: "SKU" },
          { name: "Vendors", coll: "vendors", id: "ID" },
          { name: "Purchase Orders", coll: "pos", id: "ID" },
          { name: "Material Plans", coll: "plans", id: "ID" },
          { name: "GRNs", coll: "grns", id: "ID" },
          { name: "Inwards", coll: "inwards", id: "ID" },
          { name: "Outwards", coll: "outwards", id: "ID" },
          { name: "Returns", coll: "returns", id: "ID" },
        ].map((item) => (
          <Card key={item.coll} className="p-4">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-sm font-bold text-[#1A1A2E]">{item.name}</h2>
              <StatusBadge status="Active" />
            </div>
            <p className="text-[12px] text-[#6B7280] mb-2">
              Collection: <code>{item.coll}</code> <br/>
              Key: <code>{item.id}</code>
            </p>
            <div className="bg-gray-50 rounded px-2 py-1 font-mono text-[10px] text-gray-500 inline-block">
              Real-time Sync
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-6 bg-orange-50 border-orange-200">
        <h3 className="text-sm font-bold text-orange-800 mb-2">Setup Instructions</h3>
        <p className="text-[13px] text-orange-700 leading-relaxed">
          To make this work, you need to set up a Firebase project and add the following environment variables in the <b>Settings</b> menu:
        </p>
        <ul className="list-disc list-inside mt-2 text-[13px] text-orange-700 space-y-1 font-mono">
          <li>VITE_FIREBASE_API_KEY</li>
          <li>VITE_FIREBASE_AUTH_DOMAIN</li>
          <li>VITE_FIREBASE_PROJECT_ID</li>
          <li>VITE_FIREBASE_STORAGE_BUCKET</li>
          <li>VITE_FIREBASE_MESSAGING_SENDER_ID</li>
          <li>VITE_FIREBASE_APP_ID</li>
        </ul>
        <p className="mt-3 text-[13px] text-orange-700">
          Also, ensure your Firestore Rules allow reads and writes to the <code>form_submissions</code> collection.
        </p>
      </Card>
    </div>
  );
};
