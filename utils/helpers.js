export const generateTrackingNumber = () => {
  const timestamp = Date.now()
  const random = Math.floor(Math.random() * 10000)
  return `COURIER-${timestamp}-${random}`
}

export const calculateShippingCost = (parcelType, distance) => {
  const baseCost = {
    document: 50,
    "small-package": 100,
    "medium-package": 200,
    "large-package": 400,
  }

  const costPerKm = 2
  return baseCost[parcelType] + distance * costPerKm
}

export const formatDate = (date) => {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}
