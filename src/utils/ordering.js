export function moveItemToPosition(items, itemId, newPosition) {
  if (!Number.isInteger(newPosition) || newPosition < 1 || newPosition > items.length) {
    throw new Error('newPosition must be an integer within the list bounds')
  }

  const sortedItems = [...items].sort((a, b) => Number(a.order) - Number(b.order))
  const itemToMove = sortedItems.find(item => item.id === itemId)

  if (!itemToMove) {
    throw new Error('item must exist in the list')
  }

  const remainingItems = sortedItems.filter(item => item.id !== itemId)
  remainingItems.splice(newPosition - 1, 0, itemToMove)

  return remainingItems.map((item, index) => ({
    id: item.id,
    order: index + 1
  }))
}
