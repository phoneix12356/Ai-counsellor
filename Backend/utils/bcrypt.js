import bcrypt from "bcrypt";

const hashPassword = async (password) => {
  const saltRound = 10;
  const hashedPassword = await bcrypt.hash(password, saltRound);
  return hashedPassword;
}

const verifyPassword = async (password, hashedPassword) => {
  const isPasswordMatch = await bcrypt.compare(password, hashedPassword);
  return isPasswordMatch;
}

export { hashPassword, verifyPassword };