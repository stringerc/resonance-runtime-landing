export default function handler(req, res) {
  res.status(200).json({ 
    message: "Pages Router test works!",
    timestamp: new Date().toISOString(),
    router: "pages"
  });
}
