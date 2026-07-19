import { serve } from "https://deno.land/std/http/server.ts";

serve(async (req) => {
  try {
    const {
      nominee_id,
      user_id,
      phone,
      votes
    } = await req.json();


    const amount = votes * 5;


    const response = await fetch(
      "YOUR_LIPILA_PAYMENT_ENDPOINT",
      {
        method: "POST",
        headers:{
          "Content-Type":"application/json",
          "Authorization":
          `Bearer ${Deno.env.get("LIPILA_API_KEY")}`
        },
        body: JSON.stringify({
          merchant_id:
          Deno.env.get("LIPILA_MERCHANT_ID"),

          amount,
          currency:"ZMW",

          phone,

          reference:
          `VOTE-${Date.now()}`,

          description:
          `${votes} votes payment`
        })
      }
    );


    const data = await response.json();


    return new Response(
      JSON.stringify(data),
      {
        headers:{
          "Content-Type":"application/json"
        }
      }
    );


  } catch(error){

    return new Response(
      JSON.stringify({
        error:error.message
      }),
      {
        status:500
      }
    );
  }
});