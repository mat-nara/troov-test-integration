const { spawn, execSync } = require("child_process");
const chalk = require("chalk");
const groups = require("./test-groups");

// ---------------------- CONFIG ----------------------
const groupName = process.argv[2];       // ex: "signalement-arrivee"
const MODE = process.argv[3] || "serie"; // "serie" ou "parallel"
const MAX_PARALLEL = 4;                  // nombre max de profils en parallèle

if (!groups[groupName]) {
  console.error(chalk.red(`❌ Groupe inconnu: ${groupName}`));
  process.exit(1);
}

const commands = groups[groupName];

// ---------------------- FONCTIONS ----------------------
function printHeader(profileName) {
  const border = "*".repeat(100);
  console.log(chalk.blue(border));
  console.log(chalk.blue(`Profile: ${profileName}`));
  console.log(chalk.blue(border));
}

// ---------------------- MODE SERIE ----------------------
if (MODE === "serie") {
  console.log(chalk.yellow(`\n▶ Running group "${groupName}" in serie mode\n`));

  for (const cmd of commands) {
    const profileMatch = cmd.match(/--profile (\S+)/);
    const profileName = profileMatch ? profileMatch[1] : cmd;

    // Header simple
    const border = "*".repeat(100);
    console.log(border);
    console.log(`Profile: ${profileName}`);
    console.log(border);

    try {
      execSync(cmd, { stdio: "inherit", shell: true });
      console.log(chalk.green(`✅ Profile finished successfully: ${profileName}\n`));
    } catch (error) {
      console.error(chalk.red(`❌ Profile failed: ${profileName}\n`));
    }
  }
  console.log(chalk.green(`\n✅ All profiles finished (serie) for group "${groupName}"!\n`));
}

// ---------------------- MODE PARALLELE ----------------------
else if (MODE === "parallel") {
  console.log(chalk.yellow(`\n▶ Running group "${groupName}" in parallel mode (max ${MAX_PARALLEL} profiles at a time)\n`));

  const results = []; // stocke { profileName, stdout, stderr, code } pour chaque profil
  let index = 0;
  let running = 0;

  function runNext() {
    if (index >= commands.length) return;

    const cmd = commands[index];
    const profileMatch = cmd.match(/--profile (\S+)/);
    const profileName = profileMatch ? profileMatch[1] : cmd;
    const currentIndex = index;
    index++;
    running++;

    const child = spawn(cmd, { shell: true, stdio: "pipe" });

    let stdoutBuffer = "";
    let stderrBuffer = "";

    child.stdout.on("data", (data) => {
      stdoutBuffer += data.toString();
    });

    child.stderr.on("data", (data) => {
      stderrBuffer += data.toString();
    });

    child.on("close", (code) => {
      results[currentIndex] = { profileName, stdout: stdoutBuffer, stderr: stderrBuffer, code };
      running--;
      runNext(); // lancer le suivant si des slots sont libres

      // Afficher les résultats seulement quand tous sont terminés
      if (results.filter(Boolean).length === commands.length && running === 0) {
        console.log(chalk.yellow(`\n▶ Final results for group "${groupName}":\n`));
        for (const res of results) {
          printHeader(res.profileName);
          if (res.stdout) console.log(res.stdout);
          if (res.stderr) console.error(chalk.red(res.stderr));

          if (res.code === 0) {
            console.log(chalk.green(`✅ Profile finished successfully: ${res.profileName}\n`));
          } else {
            console.error(chalk.red(`❌ Profile failed: ${res.profileName}\n`));
          }
        }
        console.log(chalk.green(`\n✅ All profiles finished (parallel) for group "${groupName}"!\n`));
      }
    });
  }

  // Démarre les premiers MAX_PARALLEL
  for (let i = 0; i < MAX_PARALLEL && i < commands.length; i++) {
    runNext();
  }
}
