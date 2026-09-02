"use client"

useEffect(() => {
    // Retrieve payload checking localStorage first, then falling back to sessionStorage
    const storedData =
      localStorage.getItem("biz_data") || sessionStorage.getItem("biz_data");

    if (storedData) {
      try {
        const parsed = JSON.parse(storedData);
        setData(parsed);
      } catch (err) {
        console.error("Failed to parse stored session data", err);
      }
    }
    setLoading(false);
  }, []);
