 export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/test") {
      try {
        const result = await env.sotag_db
          .prepare("SELECT COUNT(*) as count FROM products")
          .first();

        return Response.json({
          status: "✅ Success",
          products_in_db: result ? result.count : 0,
          binding_used: "sotag_db",
          message: "Binding is correct"
        });
      } catch (err) {
        return Response.json({ 
          error: err.message 
        }, { status: 500 });2
      }
    }

    return new Response("sotag worker ready → go to /test", {
      headers: { "Content-Type": "text/plain" }
    });
  }
};

// comment 

