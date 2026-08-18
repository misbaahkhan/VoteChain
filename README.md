# VoteChain

### Secure Digital Voting Platform for Institutional Elections

VoteChain is a full-stack digital voting platform designed to simplify and secure institutional elections. It provides separate workflows for administrators and eligible students, covering student registration, election management, candidate management, secure voting, result publication, and password recovery.

The platform is designed with authentication, role-based authorization, one-vote-per-election enforcement, and cryptographic vote-integrity verification.

---

## Overview

Traditional institutional elections can involve manual registration, paper-based voting, lengthy counting processes, and limited transparency.

VoteChain provides a centralized digital platform where:

- Administrators manage students and elections.
- Students can securely access elections they are eligible for.
- Each student can vote only once per election.
- Votes are recorded digitally.
- Election results can be published to eligible voters after completion.
- Stored votes include cryptographic integrity information to help detect unauthorized database modification.

---

## Key Objectives

1. **Secure Digital Voting**
   
   Provide a controlled and authenticated environment for conducting institutional elections digitally.

2. **Efficient Election Management**
   
   Allow administrators to manage students, candidates, elections, and election results from a centralized dashboard.

3. **One Student, One Vote**
   
   Ensure that an eligible student can cast only one vote in a particular election.

4. **Vote Integrity**
   
   Detect unauthorized modification of stored vote data using HMAC-SHA256 and a chained hash mechanism.

---

## Key Features

### Admin Portal

- Secure administrator authentication
- Role-based access control
- Student management
- Import students from multiple CSV files
- Automatic initial student password generation
- Election creation and management
- Candidate management
- Election status tracking
- Result monitoring
- Election result viewing
- Admin password recovery through email OTP

### Student Portal

- Secure student login
- First-login password handling
- View eligible elections
- View election details and candidates
- Cast a vote
- One-vote-per-election enforcement
- View completed election results
- Student password recovery through email OTP

### Security Features

- JWT-based authentication
- Role-based authorization
- Password hashing using bcrypt
- Email OTP-based password recovery
- MongoDB unique constraint for preventing duplicate votes
- HMAC-SHA256-based vote integrity verification
- Chained vote hashes for tamper detection
- Environment variables for sensitive configuration

---

## Vote Integrity Mechanism

VoteChain does not rely on blockchain for vote integrity.

Instead, the platform uses cryptographic mechanisms to make stored votes tamper-evident.

Each vote stores:

```text
previousHash
integrityHash
