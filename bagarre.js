let json_data;
let objectives;


function clearObjectiveDisplay()
{
    let to_hide = [
        "#objective_title",
        "#objective_description",
        "#ok_button"
    ];
    for (const class_name of to_hide){
        document.querySelector(class_name).style.display = "none";
    }
}

async function initialize()
{
    objectives = [];
    clearObjectiveDisplay();
    document.querySelector("#opponent_title").innerHTML = "Premier combattant";

    const response = await fetch('./json_files/longue.json');
    if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
    }
    json_data = await response.json();
}

function getRandomInt(max)
{
    return Math.floor(Math.random() * max);
}

function getObjective()
{
    let objective;
    if (objectives.length == 0)
    {
        objective = json_data[getRandomInt(json_data.length)];
    }
    else
    {
        let compatible_objectives = getCompatibleObjective(objectives[0]);
        if (compatible_objectives.length == 0)
        {
            objective =
            {
                "name": "Aucun objectif n'est compatible avec le premier objectif (" + objectives[0]["name"] + ").",
                "description": "Tu peux demander à ton adversaire de refaire un tirage, et dire à celui qui a pondu les objectifs qu'il a fait n'imp'.",
                "type": ""
            }
        }
        else
        {
            objective = json_data[getRandomInt(compatible_objectives.length)];
        }
    }
    objectives.push(objective);

    let objective_title_div = document.querySelector("#objective_title");
    objective_title_div.style.display = "block";
    if (objective["type"] == "objective")
    {
        objective_title_div.innerHTML = "Objectif : " + objective["name"];
    }
    else if (objective["type"] == "constraint")
    {
        objective_title_div.innerHTML = "Contrainte : " + objective["name"];
    }
    else if (objective["type"] == "shared")
    {
        document.querySelector("#opponent_title").innerHTML = "Pour les deux combattants";
        objective_title_div.innerHTML = "Même objectif pour les deux combattants : " + objective["name"];
    }
    else
    {
        objective_title_div.innerHTML = objective["name"];
    }

    let objective_description_div = document.querySelector("#objective_description");
    objective_description_div.style.display = "block";
    objective_description_div.innerHTML = objective["description"];

    document.querySelector("#get_objective_button").style.display = "none";
    document.querySelector("#ok_button").style.display = "block";
}

function needOtherObjective()
{
    if (objectives.length == 2) return false;
    if ((objectives.length == 1) && (objectives[0]["type"] == "shared")) return false;
    return true;
}

function validateObjective()
{
    if (needOtherObjective())
    {
        document.querySelector("#opponent_title").innerHTML = "Second combattant";
        clearObjectiveDisplay();
    }
    else
    {
        objectives = [];
        document.querySelector("#opponent_title").innerHTML = "Premier combattant";
        clearObjectiveDisplay();
    }
    document.querySelector("#get_objective_button").style.display = "block";
}

function getCompatibleObjective(first_objective)
{    
    const first_name = first_objective["name"];
    let compatible_objectives = [];
    for (const objective of json_data)
    {
        if (objective["type"] == "shared") continue;
        const name = objective["name"];
        if (("only_match_with" in first_objective) && !first_objective["only_match_with"].includes(name)) continue;
        if (("do_not_match_with" in first_objective) && first_objective["do_not_match_with"].includes(name)) continue;
        if (("only_match_with" in objective) && !objective["only_match_with"].includes(first_name)) continue;
        if (("do_not_match_with" in objective) && objective["do_not_match_with"].includes(first_name)) continue;
        compatible_objectives.push(objective);
 
    }

    return compatible_objectives;
}

function logCompatibleObjectives()
{
    for (const objective of json_data)
    {
        if (objective["type"] == "shared") continue;

        names = [];
        for (other_obj of getCompatibleObjective(objective))
        {
            names.push(other_obj["name"]);
        }
        console.log("Compatible objectives with " + objective["name"] + ": " + names);
    } 
}

window.addEventListener("load", function ()
{
    initialize();
});
