const generateHooks = async () => {
  if (!hooksState.description || !canGenerate) return;
  setLoadingHooks(true);
  setHooksState(s => ({ ...s, result: "", liked: [] }));
  if (!user) { incrementLocalGenerations(); setGenerationsLeft(FREE_LIMIT - getLocalGenerations()); }
  else if (!isPremium) setGenerationsLeft((g) => g - 1);

  // Récupérer le token session
  const { data: { session } } = await supabase.auth.getSession();
  const headers = { "Content-Type": "application/json" };
  if (session?.access_token) headers["Authorization"] = `Bearer ${session.access_token}`;

  const res = await fetch("/api/generate", {
    method: "POST",
    headers,
    body: JSON.stringify({ description: hooksState.description, platform, tone, langue }),
  });
  const data = await res.json();
  setHooksState(s => ({ ...s, result: data.result }));
  setLoadingHooks(false);
};