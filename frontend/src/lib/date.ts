const formatAvailabilityDate = (isoDateTime: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "Asia/Jakarta",
    }
  
    return new Date(isoDateTime).toLocaleString("id-ID", options)
  }  