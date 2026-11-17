# Setting up the `haki-tools` AWS account (Everett does this; about 15 minutes)

**What you end up with:** a new AWS account just for Haki Tools inside your existing AWS Organization, plus a CLI profile named `haki-tools` on this Mac that Claude can use. It is the same pattern as `rvrmmo-s5`.

**Why a separate account:** the website's bills, permissions and any mistakes stay walled off from RVRMMO. Claude's `rvrmmo-s5` key cannot touch the website, and the website key cannot touch the game.

**Cost:** $0. Creating an account, IAM users and access keys is free. (Approval lines A1 and A2 in [HOSTING-AND-COSTS.md](HOSTING-AND-COSTS.md).)

> Do not paste any access key or secret into the chat. You type them only into the `aws configure` prompt in your own terminal (step 5).

## Step 1: Create the member account

1. Sign in to the AWS console as your **Organization's management account** (the account that owns RVRMMO's member account, not the RVRMMO account itself).
2. Open **AWS Organizations**, go to **AWS accounts**, and click **Add an AWS account**.
3. Choose **Create an AWS account** and fill in:
   - **AWS account name:** `haki-tools`
   - **Email address of the account's owner:** an address no other AWS account uses. A plus-address of your normal inbox works, for example `yourname+aws-haki@yourdomain`. *Why:* AWS requires a unique email per account, and plus-addresses still land in your inbox.
   - **IAM role name:** leave the default `OrganizationAccountAccessRole`. *Why:* this lets you step into the new account from the management account without a separate password.
4. Click **Create AWS account**. Creation takes a minute or two. When it finishes, copy the new **12-digit account ID** (it is fine to tell Claude this number; it is not a secret).

## Step 2: Switch into the new account

1. In the top-right menu, choose **Switch role**.
2. Enter **Account:** the new 12-digit ID, **Role:** `OrganizationAccountAccessRole`, **Display name:** `haki-tools`, then **Switch role**.
   *Why:* you are now acting inside the new account as an administrator, with no new password created.

## Step 3: Turn on the guardrails (still inside `haki-tools`)

1. Open **Billing and Cost Management**, go to **Budgets**, and click **Create budget**. Choose **Use a template**, then **Monthly cost budget**. Name it `haki-tools-monthly`, set the amount to `$5`, and put your email in the recipients. Click **Create**. *(Line A3. Claude can also do this step from Terraform if you prefer; tell it which.)*
   - Note: if the Budgets page is blocked inside a member account, create the same budget from the management account and filter it to the `haki-tools` account.

## Step 4: Create Claude's deploy user

1. Open **IAM**, go to **Users**, and click **Create user**.
2. **User name:** `claude-haki-deployer`. Leave "Provide user access to the AWS Management Console" **unchecked**. *Why:* this user is for the command line only and never needs a console password.
3. **Permissions:** choose **Attach policies directly** and tick **AdministratorAccess**. *Why:* Terraform has to create S3, CloudFront, ACM, Lambda, API Gateway, SES and IAM roles. Because this account holds nothing but the website, admin here cannot reach RVRMMO or your management account. Once slice S3 is done, Claude will propose a narrower policy.
4. Click **Create user**, open the user, go to **Security credentials**, then **Create access key**. Choose **Command Line Interface (CLI)**, tick the confirmation box, then click **Next** and **Create access key**.
5. Leave this page open for step 5. You will not be able to see the secret again after you close it.

## Step 5: Save the profile on this Mac

In your own Terminal (not in the chat), run:

```bash
aws configure --profile haki-tools
```

Answer the prompts: paste the **Access key ID**, then the **Secret access key**, then region `us-east-1`, then output `json`. Then close the AWS access-key page.

*Why:* the keys go into `~/.aws/credentials` on your Mac. Claude refers to them only by the profile name and never sees or prints the values.

## Step 6: Tell Claude it's done

Tell Claude "haki-tools profile is ready". Claude will run one read-only check:

```bash
aws sts get-caller-identity --profile haki-tools
```

This proves the profile works and points at the new account, not RVRMMO. Then Claude asks for approval of lines B1–B8 before creating anything.

## Later hardening (optional, after S3)

- Swap AdministratorAccess for a policy limited to the services the site uses.
- Or replace the access key with IAM Identity Center (SSO) sign-in, which uses short-lived credentials.
- Rotate the access key every 90 days. Claude can remind you.
