# ⚡ TechSpark — Static Website Hosting on Amazon S3

TechSpark is a static e-commerce storefront for electronics and SaaS products (HTML, CSS and vanilla JavaScript — no build step, no backend). This guide walks through hosting it on **Amazon S3 static website hosting**, including the **bucket policy** that makes the site public and the **IAM policy** that controls who may deploy to it.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Architecture](#2-architecture)
3. [Prerequisites](#3-prerequisites)
4. [Step 1 — Create the S3 Bucket](#4-step-1--create-the-s3-bucket)
5. [Step 2 — Upload the Website Files](#5-step-2--upload-the-website-files)
6. [Step 3 — Enable Static Website Hosting](#6-step-3--enable-static-website-hosting)
7. [Step 4 — Allow Public Access (Block Public Access)](#7-step-4--allow-public-access-block-public-access)
8. [Step 5 — Apply the Bucket Policy](#8-step-5--apply-the-bucket-policy)
9. [Step 6 — Create the IAM Policy and User/Role](#9-step-6--create-the-iam-policy-and-userrole)
10. [Step 7 — Test the Website](#10-step-7--test-the-website)
11. [Deploying with the AWS CLI](#11-deploying-with-the-aws-cli)
12. [Bucket Policy vs IAM Policy — Explained](#12-bucket-policy-vs-iam-policy--explained)
13. [Troubleshooting](#13-troubleshooting)
14. [Security Best Practices](#14-security-best-practices)
15. [Production Upgrade: CloudFront + HTTPS](#15-production-upgrade-cloudfront--https)
16. [Cost Estimate](#16-cost-estimate)
17. [Cleanup](#17-cleanup)

---

## 1. Project Overview

### File structure

```
TechSpark/
├── index.html        # Page markup (header, product grid, SaaS section, cart drawer)
├── style.css         # All styling
├── script.js         # Product data, search, filters, cart, checkout, effects
├── laptop.jpg
├── smartphone.jpg
├── headphones.jpg
├── smartwatch.jpg
├── keyboard.jpg
├── mouse.jpg
├── monitor.jpg       # referenced in script.js — add this image
└── tablet.jpg        # referenced in script.js — add this image
```

### Features

- Product catalogue rendered from a JavaScript array (8 products across Laptops, Smartphones, Audio, Accessories)
- Search, category filter, Deals, Electronics and New Arrivals views
- Shopping cart drawer with add/remove and running total
- SaaS solutions section
- Pure client-side code → a perfect fit for S3 static hosting

> ℹ️ **Note:** the original upload had stray Markdown code fences in `index.html` and `style.css`, and `script.js` references `monitor.jpg` and `tablet.jpg`, which were not in the zip. Use the corrected `TechSpark-fixed.zip`, and add those two images (see [Troubleshooting](#13-troubleshooting)).

---

## 2. Architecture

```
                 ┌─────────────────────────────────────────┐
   Visitor ────► │  S3 Website Endpoint (HTTP)             │
   (browser)     │  http://<bucket>.s3-website-<region>... │
                 │                                         │
                 │  Bucket: index.html, style.css, *.jpg   │
                 │  Protected by:                          │
                 │   • Bucket Policy  (public read)        │
                 │   • Block Public Access settings        │
                 └─────────────────────────────────────────┘
                              ▲
                              │ s3:ListBucket / GetObject / PutObject
                 ┌────────────┴────────────┐
   Developer ──► │  IAM User / Role        │  (IAM policy attached)
   (deploys)     └─────────────────────────┘
```

Two separate permission layers are involved:

| Layer | Who it applies to | Purpose |
|---|---|---|
| **Bucket policy** | Everyone on the internet (`Principal: "*"`) | Lets visitors **read** the site files |
| **IAM policy** | Your own IAM user/role | Lets you **list, upload and read** files in the bucket |

---

## 3. Prerequisites

- An AWS account
- The `TechSpark` files extracted locally (and the stray code fences removed)
- *(Optional)* [AWS CLI v2](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html) configured with `aws configure`
- Decide on a **globally unique** bucket name (e.g. `techspark-store-yourname-2026`) and an AWS **Region** (e.g. `ap-south-1` Mumbai — closest to Pune)

---

## 4. Step 1 — Create the S3 Bucket

### Console

1. Open the **S3 Console** → **Create bucket**.
2. **Bucket name:** `techspark-store-yourname-2026` (lowercase, no spaces, globally unique).
3. **AWS Region:** `Asia Pacific (Mumbai) ap-south-1` (or your choice).
4. **Object Ownership:** keep **ACLs disabled (recommended)**.
5. **Block Public Access settings:** *leave all four boxes ticked for now* — you will relax this deliberately in [Step 4](#7-step-4--allow-public-access-block-public-access).
6. **Bucket Versioning:** *Enable* (recommended — lets you roll back a bad deploy).
7. Click **Create bucket**.

### CLI

```bash
export BUCKET=techspark-store-yourname-2026
export REGION=ap-south-1

aws s3api create-bucket \
  --bucket $BUCKET \
  --region $REGION \
  --create-bucket-configuration LocationConstraint=$REGION

aws s3api put-bucket-versioning \
  --bucket $BUCKET \
  --versioning-configuration Status=Enabled
```

> For `us-east-1`, omit the `--create-bucket-configuration` flag.

---

## 5. Step 2 — Upload the Website Files

### Console

1. Open your bucket → **Upload** → **Add files**.
2. Select `index.html`, `style.css`, `script.js` and all `.jpg` images (including `monitor.jpg` and `tablet.jpg` once you add them). **Keep them in the bucket root** — `index.html` references `style.css` and `script.js` with relative paths, and `script.js` references the images by file name only.
3. Click **Upload**.

### CLI

```bash
cd TechSpark
aws s3 sync . s3://$BUCKET --exclude ".git/*" --exclude "README.md"
```

---

## 6. Step 3 — Enable Static Website Hosting

### Console

1. Bucket → **Properties** tab → scroll to **Static website hosting** → **Edit**.
2. Select **Enable**, hosting type **Host a static website**.
3. **Index document:** `index.html`
4. **Error document:** `index.html` *(or a custom `error.html` if you add one)*
5. **Save changes.**
6. Note the **Bucket website endpoint** shown at the bottom of the Properties tab, e.g.

   ```
   http://techspark-store-yourname-2026.s3-website.ap-south-1.amazonaws.com
   ```

### CLI

```bash
aws s3 website s3://$BUCKET/ --index-document index.html --error-document index.html
```

---

## 7. Step 4 — Allow Public Access (Block Public Access)

By default AWS blocks any public bucket policy. To serve a public website you must turn off the relevant blocks **for this bucket only**.

### Console

1. Bucket → **Permissions** tab → **Block public access (bucket settings)** → **Edit**.
2. **Untick** *Block all public access* (at minimum untick *Block public access to buckets and objects granted through new public bucket or access point policies* and *Block public and cross-account access to buckets and objects through any public bucket or access point policies*).
3. **Save changes** and type `confirm`.

### CLI

```bash
aws s3api put-public-access-block \
  --bucket $BUCKET \
  --public-access-block-configuration \
  "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=false,RestrictPublicBuckets=false"
```

> 💡 This keeps ACL-based public access blocked (good) while allowing the bucket **policy** to grant public read.
> Also make sure **account-level** Block Public Access isn't overriding this (S3 Console → *Block Public Access settings for this account*).

---

## 8. Step 5 — Apply the Bucket Policy

The bucket policy grants **anonymous read-only access** to every object so browsers can load the site.

### `Bucket_policy.json`

Replace `YOUR-BUCKET-NAME` with your real bucket name:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::YOUR-BUCKET-NAME/*"
    }
  ]
}
```

### What each field means

| Field | Value | Meaning |
|---|---|---|
| `Version` | `2012-10-17` | Policy language version (always use this one) |
| `Sid` | `PublicReadGetObject` | Human-readable statement label |
| `Effect` | `Allow` | Grants permission |
| `Principal` | `"*"` | **Anyone** — including unauthenticated internet users |
| `Action` | `s3:GetObject` | Only the *download/read* action — no list, write or delete |
| `Resource` | `arn:aws:s3:::BUCKET/*` | Every object **inside** the bucket (note the `/*`) |

### Apply — Console

Bucket → **Permissions** → **Bucket policy** → **Edit** → paste the JSON (with your bucket name) → **Save changes**.

### Apply — CLI

```bash
sed "s/YOUR-BUCKET-NAME/$BUCKET/" Bucket_policy.json > /tmp/bucket-policy.json
aws s3api put-bucket-policy --bucket $BUCKET --policy file:///tmp/bucket-policy.json
```

After saving, the Console shows a red **Publicly accessible** badge — that is expected for a public website.

---

## 9. Step 6 — Create the IAM Policy and User/Role

The bucket policy only lets the public *read*. To **upload and manage** files you need an IAM identity with its own permissions. Follow least privilege.

### `IAM_policy.json`

Replace `bucket-name` with your real bucket name:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:ListBucket"
      ],
      "Resource": "arn:aws:s3:::bucket-name"
    },
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject"
      ],
      "Resource": "arn:aws:s3:::bucket-name/*"
    }
  ]
}
```

### Why there are two statements

| Statement | Resource ARN | Why |
|---|---|---|
| `s3:ListBucket` | `arn:aws:s3:::bucket-name` | Listing applies to the **bucket itself** (no `/*`) |
| `s3:GetObject`, `s3:PutObject` | `arn:aws:s3:::bucket-name/*` | Reading/writing applies to the **objects** inside (with `/*`) |

> A very common mistake is putting all three actions on a single resource — the policy then silently fails for one of them.

### Create the policy — Console

1. **IAM Console** → **Policies** → **Create policy** → **JSON** tab.
2. Paste the policy (with your bucket name) → **Next**.
3. Name it `TechSparkS3DeployPolicy` → **Create policy**.

### Attach it to an identity

**Option A — IAM user (simple, for personal projects)**

1. IAM → **Users** → **Create user** → `techspark-deployer`.
2. **Attach policies directly** → select `TechSparkS3DeployPolicy`.
3. Create an access key (use case: *CLI*) and run `aws configure` with it.

**Option B — IAM role (recommended for CI/CD)**

Create a role trusted by your CI system (e.g. GitHub Actions OIDC) and attach the same policy. This avoids long-lived access keys.

### Create the policy — CLI

```bash
sed "s/bucket-name/$BUCKET/g" IAM_policy.json > /tmp/iam-policy.json

aws iam create-policy \
  --policy-name TechSparkS3DeployPolicy \
  --policy-document file:///tmp/iam-policy.json

aws iam create-user --user-name techspark-deployer
aws iam attach-user-policy \
  --user-name techspark-deployer \
  --policy-arn arn:aws:iam::<ACCOUNT_ID>:policy/TechSparkS3DeployPolicy
```

### Optional: allow deleting old files

The provided policy **cannot delete** objects. That's safe, but `aws s3 sync --delete` will fail to remove stale files. If you want that, add:

```json
"s3:DeleteObject"
```

to the second statement's `Action` list.

---

## 10. Step 7 — Test the Website

1. Open the **website endpoint** from Step 3 in a browser:
   `http://<bucket-name>.s3-website.<region>.amazonaws.com`
2. Confirm that:
   - The ⚡ **TechSpark** header and product grid load with images
   - Search, category filter and **Add to cart** work
   - The browser console (F12) shows no 403 or 404 errors
3. Command-line check:

```bash
curl -I http://$BUCKET.s3-website.$REGION.amazonaws.com
# Expect: HTTP/1.1 200 OK
```

> Use the **website endpoint**, not the plain object URL (`https://bucket.s3.region.amazonaws.com/index.html`) — the object URL will download or render the file without index/error document behaviour.

---

## 11. Deploying with the AWS CLI

Once everything is set up, a redeploy is a single command:

```bash
aws s3 sync ./TechSpark s3://$BUCKET \
  --exclude "README.md" \
  --cache-control "max-age=300"
```

Set long cache lifetimes for images and short ones for HTML/JS/CSS:

```bash
aws s3 sync ./TechSpark s3://$BUCKET --exclude "*" --include "*.jpg" \
  --cache-control "max-age=31536000,public"
aws s3 sync ./TechSpark s3://$BUCKET --exclude "*.jpg" --exclude "README.md" \
  --cache-control "max-age=300"
```

### Optional: GitHub Actions deploy

```yaml
name: Deploy to S3
on:
  push:
    branches: [main]

permissions:
  id-token: write
  contents: read

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: arn:aws:iam::<ACCOUNT_ID>:role/TechSparkDeployRole
          aws-region: ap-south-1
      - run: aws s3 sync . s3://techspark-store-yourname-2026 --exclude ".git/*" --exclude ".github/*" --exclude "README.md"
```

---

## 12. Bucket Policy vs IAM Policy — Explained

| | **Bucket Policy** | **IAM Policy** |
|---|---|---|
| Attached to | The S3 bucket (resource-based) | A user, group or role (identity-based) |
| Has `Principal`? | **Yes** — says *who* | **No** — the attached identity *is* the principal |
| Typical use | Public access, cross-account access | Controlling what your team/automation may do |
| In this project | Public can `GetObject` | Deployer can `ListBucket`, `GetObject`, `PutObject` |

**How AWS decides:** a request is allowed if **any** applicable policy allows it **and none** explicitly denies it. For same-account access, either a bucket policy *or* an IAM policy granting the action is enough. An explicit `Deny` always wins.

---

## 13. Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| **Page shows `` ```html `` text at top / CSS not applied** | Stray Markdown fences in `index.html` / `style.css` | Delete the first line (` ```html ` / ` ```css `) and last line (` ``` `) of those files, then re-upload |
| **403 Forbidden** on the website | Bucket policy missing/wrong, or Block Public Access still on | Re-check Steps 4 & 5; confirm the `Resource` ends in `/*` and the bucket name is exact |
| **Error saving bucket policy: "Access denied"** | Block Public Access blocks public policies | Untick *Block public policies* (Step 4), check account-level settings too |
| **404 Not Found** | `index.html` not in bucket root, or wrong index document name | Confirm file name/case, and that Static Website Hosting is enabled |
| **Monitor / Tablet cards show a placeholder** | `monitor.jpg` and `tablet.jpg` are referenced in `script.js` but weren't in the zip | Add both images to the project root and re-upload |
| **Images missing (broken icons)** | Image names are case-sensitive or uploaded into a sub-folder | Keep names exactly `laptop.jpg`, `smartphone.jpg`, etc., in the root |
| **CSS/JS not loading** | Wrong path or wrong content type | Ensure files are in root; re-upload with `aws s3 sync` so MIME types are set automatically |
| **Old version still showing** | Browser or CDN cache | Hard refresh (Ctrl+Shift+R); invalidate CloudFront if used |
| **`AccessDenied` when uploading with the IAM user** | `bucket-name` placeholder not replaced, or `ListBucket` on wrong ARN | Verify both ARNs; `ListBucket` must NOT have `/*` |
| **Policy placeholder mismatch** | Bucket policy uses `YOUR-BUCKET-NAME`, IAM policy uses `bucket-name` | Replace **both** with the same real bucket name |
| **Site is "Not secure" (HTTP)** | S3 website endpoints do not support HTTPS | Use CloudFront — see [section 15](#15-production-upgrade-cloudfront--https) |

---

## 14. Security Best Practices

- ✅ **Public read only.** The bucket policy allows `s3:GetObject` and nothing else — never grant `s3:PutObject`, `s3:DeleteObject` or `s3:*` to `Principal: "*"`.
- ✅ **No public listing.** Don't add `s3:ListBucket` for the public; visitors shouldn't be able to enumerate your files.
- ✅ **Keep ACLs disabled** (Object Ownership: *Bucket owner enforced*).
- ✅ **Never store secrets in the bucket.** Everything in it is world-readable — no `.env` files, keys or customer data.
- ✅ **Least-privilege IAM.** Scope to a single bucket; add `s3:DeleteObject` only if you need it.
- ✅ **Prefer roles over access keys.** If you must use keys, rotate them and never commit them to Git.
- ✅ **Enable MFA** on your root and admin accounts.
- ✅ **Turn on versioning** for easy rollback; optionally add **server access logging** or CloudTrail data events.
- ✅ **Use a dedicated bucket** for the website — don't mix it with private data.
- ⚠️ **Note on this demo:** the cart/checkout in `script.js` is client-side only. Do not collect real payments or personal data without a proper backend and HTTPS.

---

## 15. Production Upgrade: CloudFront + HTTPS

S3 website endpoints serve **HTTP only**. For HTTPS, a custom domain (e.g. `www.techspark.in`) and better performance, put **Amazon CloudFront** in front:

1. Create a CloudFront distribution with the S3 bucket as origin.
2. Use **Origin Access Control (OAC)** and keep the bucket **private** — this lets you drop the public bucket policy and Block Public Access exceptions entirely.
3. Replace the public policy with one that only allows CloudFront:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowCloudFrontServicePrincipalReadOnly",
      "Effect": "Allow",
      "Principal": { "Service": "cloudfront.amazonaws.com" },
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::YOUR-BUCKET-NAME/*",
      "Condition": {
        "StringEquals": {
          "AWS:SourceArn": "arn:aws:cloudfront::<ACCOUNT_ID>:distribution/<DISTRIBUTION_ID>"
        }
      }
    }
  ]
}
```

4. Set **Default root object** to `index.html`.
5. Request a free SSL certificate in **AWS Certificate Manager** (must be in `us-east-1` for CloudFront) and attach it.
6. Point your domain to the distribution with a **Route 53** alias record.

> When you use OAC, you point CloudFront at the **bucket REST endpoint** (not the website endpoint), so S3 website hosting settings are no longer needed.

---

## 16. Cost Estimate

For a small site like TechSpark (~150 KB total), costs are essentially negligible:

- **Storage:** well under 1 GB → a fraction of a cent per month
- **Requests:** GET requests are billed per 1,000; typical low traffic costs cents
- **Data transfer out:** the first 100 GB/month to the internet is free across AWS (check current pricing)
- **CloudFront (optional):** generous free tier

Always check the [AWS Pricing Calculator](https://calculator.aws/) for current rates, and set a **billing alarm** in AWS Budgets.

---

## 17. Cleanup

To avoid any ongoing charges and remove public exposure:

```bash
# Empty the bucket (including versions if versioning is on)
aws s3 rm s3://$BUCKET --recursive

# Delete the bucket
aws s3api delete-bucket --bucket $BUCKET --region $REGION

# Remove IAM resources
aws iam detach-user-policy --user-name techspark-deployer \
  --policy-arn arn:aws:iam::<ACCOUNT_ID>:policy/TechSparkS3DeployPolicy
aws iam delete-user --user-name techspark-deployer
aws iam delete-policy \
  --policy-arn arn:aws:iam::<ACCOUNT_ID>:policy/TechSparkS3DeployPolicy
```

> If versioning was enabled, delete all object versions and delete markers first (Console: *Empty bucket* handles this).

---

### Quick Reference Checklist

- [ ] Use the fixed files (stray ` ``` ` fences removed) and add `monitor.jpg` + `tablet.jpg`
- [ ] Create bucket (unique name, correct region)
- [ ] Upload all files to the bucket **root**
- [ ] Enable static website hosting (`index.html`)
- [ ] Relax Block Public Access (policy-related settings only)
- [ ] Apply bucket policy (public `GetObject`) with the real bucket name
- [ ] Create & attach IAM policy (`ListBucket`, `GetObject`, `PutObject`) with the real bucket name
- [ ] Test the website endpoint
- [ ] *(Production)* Add CloudFront + HTTPS and make the bucket private

---

*Built with ⚡ for TechSpark — Electronics, Gadgets & SaaS Solutions.*
