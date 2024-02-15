const users = [];

// Join user to chat
function userJoin(id, username, room, prevId) {
  const prevUserIndex = users.findIndex((user) => user.id === prevId);
  if (
    prevUserIndex !== -1 &&
    users[prevUserIndex].isAdmin &&
    users[prevUserIndex].room == room
  ) {
    users[prevUserIndex].id = id;
    console.log("prevAdmin: " + prevId, users[prevUserIndex]);
    return users[prevUserIndex];
  }
  const user = { id, username, room, isAdmin: false };

  const roomUsers = getRoomUsers(room);
  if (roomUsers.length === 0) user.isAdmin = true;

  users.push(user);

  return user;
}

// Get current user
function getCurrentUser(id) {
  return users.find((user) => user.id === id);
}

// User leaves chat
function userLeave(id) {
  const index = users.findIndex((user) => user.id === id);

  if (index !== -1) {
    if (!users[index].isAdmin) return users.splice(index, 1)[0];
  }
}

function endRoom(id) {
  const index = users.findIndex((user) => user.id === id);

  if (index != -1) {
    if (users[index].isAdmin) {
      // localStorage.removeItem("socketId");
      return users.splice(index, 1)[0];
    }
  }
}
// Get room users
function getRoomUsers(room) {
  return users.filter((user) => user.room === room);
}

module.exports = {
  users,
  userJoin,
  getCurrentUser,
  userLeave,
  endRoom,
  getRoomUsers,
};
