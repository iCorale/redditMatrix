use fuzzy_matcher::skim::SkimMatcherV2;
use fuzzy_matcher::FuzzyMatcher;
use wasm_bindgen::prelude::*;

// const WORDS: &'static str = include_str!("words.txt");

#[derive(Debug, serde::Serialize)]
pub struct Match {
    value: String,
    score: i64,
}

#[wasm_bindgen]
pub fn get_matches(
    words: JsValue,
    pattern: &str,
    mut i: Option<usize>,
) -> Result<JsValue, JsValue> {
    let words: Vec<String> = serde_wasm_bindgen::from_value(words)?;
    if let None = i {
        i = Some(10)
    }
    let matcher = SkimMatcherV2::default();
    let mut matches: Vec<Match> = Vec::new();
    for word in words.iter() {
        if let Some(score) = matcher.fuzzy_match(word, pattern) {
            matches.push(Match {
                value: word.to_string(),
                score,
            })
        }
    }
    matches.sort_by(|a, b| b.score.cmp(&a.score));
    serde_wasm_bindgen::to_value(&matches[..std::cmp::min(i.unwrap(), matches.len())])
        .map_err(|err| err.into())
}
