const main = async () => {
  const response = await fetch(
    "https://primitiv-discord-bot.primitiv-bot.workers.dev/generate-report",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    }
  );

  console.log(await response.json());
};

main();
