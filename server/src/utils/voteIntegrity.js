import crypto from "crypto";

const getIntegritySecret = () => {
  const secret =
    process.env.VOTE_INTEGRITY_SECRET;

  if (!secret) {
    throw new Error(
      "VOTE_INTEGRITY_SECRET is not configured."
    );
  }

  return secret;
};

// =====================================================
// CREATE HMAC FOR VOTE
// =====================================================

export const createVoteIntegrityHash = ({
  electionId,
  studentId,
  candidateStudentId,
  candidateName,
  votedAt,
  previousHash,
}) => {
  const data = [
    electionId,
    studentId,
    candidateStudentId,
    candidateName,
    new Date(votedAt).toISOString(),
    previousHash || "GENESIS",
  ].join("|");

  return crypto
    .createHmac(
      "sha256",
      getIntegritySecret()
    )
    .update(data)
    .digest("hex");
};

// =====================================================
// VERIFY HMAC
// =====================================================

export const verifyVoteIntegrityHash = ({
  electionId,
  studentId,
  candidateStudentId,
  candidateName,
  votedAt,
  previousHash,
  integrityHash,
}) => {
  const expectedHash =
    createVoteIntegrityHash({
      electionId,
      studentId,
      candidateStudentId,
      candidateName,
      votedAt,
      previousHash,
    });

  return crypto.timingSafeEqual(
    Buffer.from(expectedHash, "hex"),
    Buffer.from(integrityHash, "hex")
  );
};