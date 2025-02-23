function parseString(input: string) {
  const regex =
    /Row:\s(\d+)\s_id=(\d+),\saddress=(\+[\d]+),\sbody=(.*?),\sdate=(\d+)/;
  const match = input.match(regex);

  if (match) {
    return {
      row: match[1],
      _id: match[2],
      address: match[3],
      body: match[4],
      date: parseInt(match[5], 10),
    };
  }

  return null; // Retourne null si le format ne correspond pas
}

export default parseString;
